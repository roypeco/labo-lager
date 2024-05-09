import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
    return (
      <div>
        <nav
          className="navbar navbar-expand-lg navbar-light mb-3"
          style={{ backgroundColor: '#e3f2fd' }}
        >
          <div className="container">
            <div className="mr-auto">
              <a className="navbar-brand" href="./">
                Home
              </a>
            </div>
            <div className="login-page">
                <a className="navbar-brand" href="/login">
                    login
                </a>
            </div>
            <form className="d-flex">
              <button className="btn btn-outline-primary" type="submit">
                Search
              </button>
            </form>
          </div>
        </nav>
        <div className="container">{children}</div>
      </div>
    )
  }