/**
 * frontend/src/App.jsx
 * Route table. Public homepage + Programs page; a protected example route
 * demonstrates PrivateRoute wiring. Programs are NOT listed on the homepage —
 * the homepage shows only the ProgramsTeaser bubble.
 */

import { Routes, Route, Link } from 'react-router-dom';
import ProgramsTeaser from './components/ProgramsTeaser.jsx';
import Programs from './components/Programs.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

function Nav() {
  return (
    <nav className="fv-nav">
      <Link to="/" className="fv-nav__brand">forge<span>Vidhya</span></Link>
      <div className="fv-nav__links">
        <Link to="/programs">Programs</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <>
      <section className="fv-hero">
        <p className="fv-hero__eyebrow">AI SKILLS FOR TIER-3 ENGINEERING STUDENTS</p>
        <h1 className="fv-hero__title">
          Learn by shipping. <span className="fv-grad">Not by watching.</span>
        </h1>
        <p className="fv-hero__lede">
          A cohort-based forge where every field ends with a real, shipped project.
        </p>
      </section>
      {/* Homepage shows ONLY the teaser bubble — no program listing. */}
      <ProgramsTeaser to="/programs" />
    </>
  );
}

function Login() {
  return (
    <div className="fv-stub">
      <h1>Login</h1>
      <p>Auth form goes here — POST to <code>/api/auth/login</code> via the api.js instance.</p>
    </div>
  );
}

function Unauthorized() {
  return (
    <div className="fv-stub">
      <h1>Unauthorized</h1>
      <p>You don't have access to this page.</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="fv-stub">
      <h1>Dashboard</h1>
      <p>Protected route — only reachable with a valid session.</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Protected example */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<div className="fv-stub"><h1>404</h1></div>} />
        </Routes>
      </main>
    </>
  );
}
