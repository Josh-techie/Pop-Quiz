import React from 'react'
import Navbar from './NavBar'
import DashboardDynamic from './DashboardDynamic'

function Main() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 max-w-full">
      {/* Side Navigation Bar */}
      <Navbar />
      {/* Main component on basis of selected navigation from nav bar */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-full">
        <DashboardDynamic />
      </main>
    </div>
  )
}

export default Main