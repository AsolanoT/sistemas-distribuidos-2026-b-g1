"""Build real portal/host packages and load their actual remote through the host."""
import json
import os
import re
import sys
import tempfile
import urllib.parse
import urllib.request
import urllib.error
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import operations as ops
from local_owner import execution_id
ROOT = Path(__file__).resolve().parents[1]


def execute():
    owner = execution_id()
    project = 'synkro-ui-test-' + owner
    network = project + '-network'
    labels = {'synkro.execution': owner, 'synkro.disposable': 'true'}
    with tempfile.TemporaryDirectory(prefix='synkro-ui-') as folder:
        folder = Path(folder)
        include = folder / 'compose.json'
        include.write_text(json.dumps({'include': [str(ROOT.parent / name / 'deploy/compose.yml') for name in ['synkro-front', 'synkro-auth-portal', 'synkro-customers-portal', 'synkro-products-portal', 'synkro-sales-portal']]}))
        override = folder / 'override.yml'
        override.write_text('services:\n  host:\n    ports: !override ["127.0.0.1::80"]\nnetworks:\n  platform:\n    name: ' + network + '\n')
        ownership = folder / 'ownership.json'
        ownership.write_text(json.dumps({'services': {name: {'labels': labels} for name in ['host', 'auth-portal', 'synkro-customers-portal', 'synkro-products-portal', 'synkro-sales-portal']}}))
        command = ['docker', 'compose', '-p', project, '-f', str(include), '-f', str(override), '-f', str(ownership)]
        def compose(*args, **kwargs):
            return ops.run(command + list(args), env=dict(os.environ, VITE_DEV_SIGN_IN='false'), **kwargs)
        ops.run(['docker', 'network', 'create', '--label', 'synkro.execution=' + owner, '--label', 'synkro.disposable=true', network])
        try:
            model = json.loads(compose('config', '--format', 'json'))
            ops.validate_model(model, project)
            for portal in ['products', 'sales']:
                service = model['services']['synkro-' + portal + '-portal']
                if service.get('ports') or 'platform' not in service['networks'] or service.get('secrets') or service.get('volumes'):
                    raise ops.Failure('Portal must have internal platform delivery without credential mounts')
                if service['build']['args']['VITE_BASE_PATH'] != '/remotes/' + portal + '/':
                    raise ops.Failure('Portal build base does not match host route')
                if service['environment']['HOST_ORIGIN'] != 'http://localhost:5173' or service['build']['args']['VITE_SHELL_ENTRY_URL'] != 'http://localhost:5173/assets/remoteEntry.js':
                    raise ops.Failure('Portal browser inputs must remain browser-accessible')
            customers = model['services']['synkro-customers-portal']
            if (customers.get('ports') or 'platform' not in customers['networks'] or
                    customers.get('secrets') or customers.get('volumes') or
                    model['services']['host']['build']['args']['VITE_CUSTOMERS_PORTAL_ENTRY'] != '/remotes/customers/remoteEntry.js'):
                raise ops.Failure('Customers must use its approved internal delivery and Host input')
            for name, repo in [('host', 'synkro-front'), ('auth-portal', 'synkro-auth-portal'), ('synkro-customers-portal', 'synkro-customers-portal'), ('synkro-products-portal', 'synkro-products-portal'), ('synkro-sales-portal', 'synkro-sales-portal')]:
                context = Path(model['services'][name]['build']['context']).resolve()
                if context != ROOT.parent / repo:
                    raise ops.Failure('Include resolved the wrong build context')
                # Run the repositories' existing regression suites in the real build stage.
                build = ['docker', 'build', '--target', 'build', '-f', str(context / 'deploy/Dockerfile'),
                         '-t', project + '-' + name + '-build', str(context)]
                test = ['docker', 'run', '--rm', '--label', 'synkro.execution=' + owner,
                         '--mount', f'type=bind,source={context / ".github"},target=/app/.github,readonly',
                         '--mount', f'type=bind,source={context / "README.md"},target=/app/README.md,readonly',
                         '--mount', f'type=bind,source={context / ".env.example"},target=/app/.env.example,readonly',
                         project + '-' + name + '-build', 'npm', 'test', '--', '--coverage', '--maxWorkers=2']
                if name == 'synkro-customers-portal':
                    # Angular's owning CLI contract, without React/Vitest options.
                    test = test[:-5] + ['npm', 'run', 'coverage']
                for action in [build, test]:
                    result = ops.subprocess.run(action, capture_output=True, timeout=900)
                    if result.returncode:
                        print((result.stdout + result.stderr).decode(errors='replace')[-6000:], file=sys.stderr)
                        raise ops.Failure(name + ' real build/regression failed (no secrets in this test)')
                if name == 'synkro-customers-portal':
                    ops.run(['docker', 'run', '--rm', '--label', 'synkro.execution=' + owner,
                             project + '-' + name + '-build', 'sh', '-c', 'node --test scripts/*.test.mjs'], timeout=180)
            compose('up', '-d', '--build', '--wait', '--wait-timeout', '120', timeout=900)
            compose('exec', '-T', 'host', 'nginx', '-t')
            compose('exec', '-T', 'auth-portal', 'nginx', '-t')
            compose('exec', '-T', 'synkro-customers-portal', 'nginx', '-t')
            compose('exec', '-T', 'synkro-products-portal', 'nginx', '-t')
            compose('exec', '-T', 'synkro-sales-portal', 'nginx', '-t')
            port = compose('port', 'host', '80').strip()
            prefix = 'http://' + port
            def delivery(base, entry='assets/remoteEntry.js', minimum_css=1):
                visited = set()
                kinds = {'js': 0, 'css': 0}
                def load(url, depth=0):
                    if url in visited or depth > 10:
                        return
                    visited.add(url)
                    with urllib.request.urlopen(url, timeout=15) as response:
                        text = response.read().decode()
                        kind = 'css' if url.endswith('.css') else 'js'
                        mime = response.headers.get('Content-Type', '')
                        if ('css' if kind == 'css' else 'javascript') not in mime:
                            raise ops.Failure('Host route served HTML instead of compiled ' + kind)
                        if url.endswith('remoteEntry.js') and 'no-store' not in response.headers.get('Cache-Control', ''):
                            raise ops.Failure('Remote entry must not be cached')
                    kinds[kind] += 1
                    if kind == 'js':
                        for relative in re.findall(r'["\']([^"\'\s]+\.(?:js|css))["\']', text):
                            if relative.startswith(('http:', 'https:')):
                                continue  # Shell entry is independently checked on this same host below.
                            load(urllib.parse.urljoin(url, relative), depth + 1)
                load(base + entry)
                if kinds['js'] < 2 or kinds['css'] < minimum_css:
                    raise ops.Failure('Remote must load its actual compiled JavaScript and CSS')
                print('PASS compiled entry/JavaScript/CSS delivery: ' + base + ' ' + str(kinds))
            for portal in ['auth', 'products', 'sales']:
                delivery(prefix + '/remotes/' + portal + '/')
            # Shipped Angular styles are embedded; its entry is outside assets/.
            delivery(prefix + '/remotes/customers/', entry='remoteEntry.js', minimum_css=0)
            # Actual unavailable upstream must not interrupt the host or Products.
            compose('stop', 'synkro-sales-portal')
            try:
                urllib.request.urlopen(prefix + '/remotes/sales/assets/remoteEntry.js', timeout=15)
                raise ops.Failure('Unavailable Sales unexpectedly served an entry')
            except urllib.error.HTTPError as error:
                if error.code != 502:
                    raise ops.Failure('Unexpected unavailable Sales response') from error
            with urllib.request.urlopen(prefix + '/sales', timeout=15) as response:
                if response.status != 200:
                    raise ops.Failure('Sales failure interrupted the shell')
            delivery(prefix + '/remotes/products/')
            compose('up', '-d', '--wait', '--wait-timeout', '60', 'synkro-sales-portal')
            delivery(prefix + '/remotes/sales/')
            print('PASS real unavailable Sales gives 502 while shell/Products stay reachable; actual Sales assets recover after restart')
            compose('stop', 'synkro-customers-portal')
            try:
                urllib.request.urlopen(prefix + '/remotes/customers/remoteEntry.js', timeout=15)
                raise ops.Failure('Unavailable Customers unexpectedly served an entry')
            except urllib.error.HTTPError as error:
                if error.code != 502 or 'no-store' not in error.headers.get('Cache-Control', ''):
                    raise ops.Failure('Customers outage must be controlled and uncached') from error
            with urllib.request.urlopen(prefix + '/customers/new', timeout=15) as response:
                if response.status != 200:
                    raise ops.Failure('Customers outage interrupted the shell deep link')
            delivery(prefix + '/remotes/products/')
            compose('up', '-d', '--wait', '--wait-timeout', '60', 'synkro-customers-portal')
            delivery(prefix + '/remotes/customers/', entry='remoteEntry.js', minimum_css=0)
            print('PASS actual Customers unavailable/recovered and Host deep links/Products remain usable')
            with urllib.request.urlopen(prefix + '/assets/remoteEntry.js', timeout=15) as response:
                if 'javascript' not in response.headers.get('Content-Type', ''):
                    raise ops.Failure('Shell exports not delivered')
            # Check that the real compiled host consumes both production entry inputs.
            compiled = compose('exec', '-T', 'host', 'sh', '-c', 'cat /usr/share/nginx/html/assets/*.js')
            for portal in ['auth', 'products', 'sales']:
                if 'http://localhost:5173/remotes/' + portal + '/assets/remoteEntry.js' not in compiled:
                    raise ops.Failure('Host did not compile its production ' + portal + ' input')
            if '/remotes/customers/remoteEntry.js' not in compiled:
                raise ops.Failure('Host did not consume its production Customers input')
            # A separate actual standalone build retains the default / base.
            standalone = ROOT.parent / 'synkro-sales-portal'
            standalone_image = project + '-sales-standalone'
            ops.run(['docker', 'build', '-f', str(standalone / 'deploy/Dockerfile'), '-t', standalone_image, str(standalone)], timeout=900)
            identifier = ops.run(['docker', 'create', '--label', 'synkro.execution=' + owner,
                                  '--label', 'synkro.disposable=true', '-p', '127.0.0.1::80', standalone_image]).strip()
            try:
                ops.run(['docker', 'start', identifier])
                address = ops.run(['docker', 'port', identifier, '80']).strip()
                import time
                for attempt in range(30):
                    try:
                        with urllib.request.urlopen('http://' + address + '/assets/remoteEntry.js', timeout=2):
                            break
                    except OSError:
                        time.sleep(0.2)
                delivery('http://' + address + '/')
                print('PASS actual Sales standalone / and prefixed /remotes/sales/ builds')
            finally:
                item = json.loads(ops.run(['docker', 'inspect', identifier]))[0]
                if item['Config']['Labels'].get('synkro.execution') != owner or item['Mounts']:
                    raise ops.Failure('Standalone cleanup refused unrelated resources')
                ops.run(['docker', 'rm', '-f', identifier])
            print('PASS real host, Products and Sales builds/coverage/model/internal platform/HTTP assets; shell exports preserved')
        finally:
            for identifier in ops.run(['docker', 'ps', '-aq', '--filter', 'label=com.docker.compose.project=' + project]).split():
                item = json.loads(ops.run(['docker', 'inspect', identifier]))[0]
                if item['Config']['Labels'].get('synkro.execution') != owner or any(v['Type'] == 'volume' for v in item['Mounts']):
                    raise ops.Failure('UI cleanup refused unrelated resources')
            compose('down', '--timeout', '20')
            item = json.loads(ops.run(['docker', 'network', 'inspect', network]))[0]
            if item['Labels'].get('synkro.execution') != owner or item['Containers']:
                raise ops.Failure('UI cleanup refused shared network')
            ops.run(['docker', 'network', 'rm', network])
            print('PASS UI disposable containers/network removed; build images retained as cache')


if __name__ == '__main__':
    try:
        execute()
    except ops.Failure as error:
        print('FAIL ' + str(error), file=sys.stderr)
        sys.exit(1)
