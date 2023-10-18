import { useState, useEffect } from 'react'
import "./KeyPad.css";
import "./Button.css";
import { PortsGlobal } from '../PortsGlobal';
import axios from 'axios';
import {Row,Col} from 'react-bootstrap'
import SingleDocument from './SingleDocument';



    
const DocumentHolderPage = () => {

  
    const [documentList, setDocumentList] = useState<string[]>([]);
    const serverPort = PortsGlobal.serverPort;
    const baseURL = `http://localhost:${serverPort}`;

    useEffect(() => {
      async function getAllDocuments() {
        const response = await axios.get(`${baseURL}/documents`);
        const result: string[] = response.data;
        console.log("result of all docs", result);
        // const documentNames = result.map((doc) => ({ name: doc }));
        setDocumentList(result);
        return result;
      }
      getAllDocuments();
    }, []);








  return (
    <> 
      <div className="card" style={{width:'80%', margin:"10%",alignItems:"center", border:"none"}}>
        <div className="card__body"  >
          <Row xs={1} md={3} style={{justifyContent: "space-between"}} className="g-4">
            {documentList.map((post) => (
              <Col>
                <SingleDocument name={post}/>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </>
  )
}

export default DocumentHolderPage;