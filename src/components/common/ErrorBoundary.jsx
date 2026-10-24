import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error('Application error:', error, info); }
  render() {
    if (this.state.failed) return <main className="container page"><h1>Something interrupted your visit.</h1><p>Please reload the page to continue.</p><button className="button" onClick={() => window.location.reload()}>Reload page</button></main>;
    return this.props.children;
  }
}
