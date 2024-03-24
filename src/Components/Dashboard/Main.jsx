import React from 'react'
import Navbar from './NavBar'
import Dashboard from './Dashboard'

function Main() {
  return (
 
    <div className="flex">
    {/* Side Navigation Bar */}
    <Navbar />
    {/* Main component on basis of selected navigation from nav bar */}
    <main className="grow">
      <Dashboard />
    </main>
  </div>

  )
}

export default Main