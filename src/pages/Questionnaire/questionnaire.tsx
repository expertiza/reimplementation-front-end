import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import { IQuestionnaire } from "../../utils/interfaces";
import dummyData from './dummyData.json';
import './Questionnaire.css';

const Questionnaires = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<IQuestionnaire[]>(dummyData);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter(item => 
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.children && item.children.some(child => child.name && child.name.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    const allIds = currentData.map(item => item.id);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4 questionnaire-container">
          <Row className="mt-md-2 mb-md-4">
            <Col className="text-center">
              <h1>Manage Questionnaires</h1>
            </Col>
            <hr />
          </Row>

          {/* Search Bar */}
          <Row>
            <Col>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '20px', padding: '10px' }}
              />
              <button onClick={expandAll} className="button">Expand All</button>
              <button onClick={collapseAll} className="button">Collapse All</button>
            </Col>
          </Row>

          {/* Parent List */}
          <Row>
            <Col>
              {currentData.map(item => (
                <div key={item.id} style={{ border: '1px solid #ccc', margin: '5px 0', padding: '10px' }}>
                  <span>{item.type}</span>
                  <button 
                    onClick={() => navigate(`/edit-questionnaire/${item.id}`)} 
                    className="button button-plus" 
                    style={{ marginLeft: '10px' }}
                  >
                    +
                  </button>
                  <button onClick={() => toggleExpand(item.id)} className="button" style={{ marginLeft: '10px' }}>
                    {expandedItems.includes(item.id) ? "Collapse" : "Expand"}
                  </button>
                  {expandedItems.includes(item.id) && item.children && (
                    <div style={{ paddingLeft: '20px', marginTop: '10px' }}>
                      {item.children.map(child => (
                        <div key={child.id} style={{ border: '1px solid #ccc', margin: '5px 0', padding: '10px' }}>
                          <strong>{child.name}</strong>
                          <button 
                            onClick={() => navigate(`/edit/${child.id}`)} 
                            className="button button-plus" 
                            style={{ marginLeft: '10px' }}
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Col>
          </Row>

          {/* Simple Pagination Logic */}
          <Row>
            <Col className="text-center" style={{ marginTop: '20px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="button"
              >
                Previous
              </button>
              <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="button"
              >
                Next
              </button>
              <select 
                value={itemsPerPage} 
                onChange={handleItemsPerPageChange} 
                style={{ marginLeft: '10px', padding: '5px' }}
              >
                <option value={10}>1-10</option>
                <option value={15}>10-25</option>
                <option value={25}>25-50</option>
              </select>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Questionnaires;
