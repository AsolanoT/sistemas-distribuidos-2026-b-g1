import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import { initials } from '../api/format';
import { useSession } from '../features/auth/SessionContext';
import { modulesFor, ROLE_LABELS } from '../features/auth/roles';
import { Badge, Button } from './ui';
import Icon from './Icon';

export default function Sidebar() {
  const { user, logout } = useSession();
  const modules = modulesFor(user.role);

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={logo} alt="Synkro Tech" className="brand-mark" />
        <div>
          <div className="brand-name">Synkro Tech</div>
          <div className="brand-sub">MVP</div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-label">Modules</div>
        {modules.map((module) => (
          <NavLink
            key={module.key}
            to={module.path}
            className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
          >
            <Icon name={module.icon} />
            {module.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="session-card">
          <div className="row">
            <span className="avatar">{initials(user.name)}</span>
            <div className="spacer">
              <div className="session-name">{user.name}</div>
              <Badge tone="steel">{ROLE_LABELS[user.role] ?? user.role}</Badge>
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={logout}>
          <Icon name="logout" className="nav-icon" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
