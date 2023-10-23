import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

function NavBar() {
  
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/all">All</Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default NavBar;