import json,os,subprocess,tempfile,unittest,uuid,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class MongoTraceTest(unittest.TestCase):
    def test_preload_propagates_to_real_node_child_without_exposing_buffers(self):
        with tempfile.TemporaryDirectory() as folder:
            run=Path(folder)/('run-'+uuid.uuid4().hex);run.mkdir();(run/'.local-owner').write_text(run.name)
            env=dict(os.environ,SYNKRO_LOCAL_OWNER_FILE=str(run/'.execution-ids'))
            code="require('node:child_process').execFileSync(process.execPath,['-e','process.stdout.write(\"sensitive-sentinel\")']);"
            result=subprocess.run([shutil.which('node') or 'node','--require',str(ROOT/'tests/mongo_phase_trace.cjs'),'-e',code],env=env,capture_output=True,timeout=20)
            self.assertEqual(result.returncode,0,'Tracer must preserve real child execution; diagnostics suppressed')
            trace=(run/'mongo-phase-trace.jsonl').read_text()
            self.assertNotIn('sensitive-sentinel',trace)
            self.assertTrue(any(json.loads(x)['phase']=='end' for x in trace.splitlines()))
