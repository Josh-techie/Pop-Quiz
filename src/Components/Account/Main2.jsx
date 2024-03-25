import React from 'react';
import SimpleBar from 'simplebar-react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
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
    <div className='flex'>

      <Navbar />
          <main className="main-content">
        {/* <Header /> */}
      
      <SimpleBar style={{ maxHeight: '100vh' }}>
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
