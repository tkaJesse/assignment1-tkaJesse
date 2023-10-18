import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import SpreadSheet from './SpreadSheet';


interface StateProperties {
    name: string;
}

const SingleDocument: React.FC<StateProperties> = ({ name }) => {
    const [documentTitle, setDocumentTitle] = useState(name);
    const navigate = useNavigate(); 
    // create a onClick function, when click at it, it should navigate to the url /:testName

    const href = window.location.href;
    


    function OnButtonClick(event: React.MouseEvent<HTMLButtonElement>): void {
            const text = event.currentTarget.textContent;
            let path;
            if (text) {
                path = `${text}`;   
            } else {
                path = 'test'
            }
            path = path.trim();
            const currentURL = window.location.href;
            // remove anything after the last slash
            const index = currentURL.lastIndexOf('/');
            const newURL = currentURL.substring(0, index + 1) + path;

        
            // set the URL
            window.history.pushState({}, '', newURL);
            // now reload the page
            window.location.reload();
            navigate(path);
    }
    return (
        <Card style={{ width: '18rem', backgroundColor:'pink', margin:"10px", border:"10px" }}>
            <Card.Body >
                <Card.Title onClick={OnButtonClick}> {documentTitle}</Card.Title>
      </Card.Body>
    </Card>
  );
}

export default SingleDocument;