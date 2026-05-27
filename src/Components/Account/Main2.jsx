import React from 'react';
import SimpleBar from 'simplebar-react'
// Router imports removed (not used)
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from './helpers'
import { Container } from '@chakra-ui/layout'
import Content from './Content/Content'
import Sidebar from './Sidebar/Sidebar'
import Cover from './Cover'
import Navbar from '../Dashboard/NavBar';
import "../../styles/index.css";


export default function App() {

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 max-w-full">
      <Navbar />

      <main className="flex-1 flex flex-col overflow-hidden max-w-full">
        <SimpleBar style={{ maxHeight: '100vh', width: '100%' }}>
          <ChakraProvider theme={theme}>
            <Cover />

            <Container display={{ base: 'block', md: 'flex' }} maxW="container.xl">
              <Sidebar />
              <Content />
            </Container>
          </ChakraProvider>
        </SimpleBar>
      </main>
    </div>
  )
}
