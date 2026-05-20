import React from 'react'
import Navbar from './NavBar'
import DashboardDynamic from './DashboardDynamic'

function Main() {
  return (

    <div className="flex">
    {/* Side Navigation Bar */}
    <Navbar />
    {/* Main component on basis of selected navigation from nav bar */}
    <main className="grow">
      <DashboardDynamic />
    </main>
  </div>

  )
}

export default Main