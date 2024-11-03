import React, { useState, useMemo } from "react";
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

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.children && item.children.some(child => child.name && child.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const allIds = useMemo(() => currentData.map(item => item.id), [currentData]);

  const expandAll = () => setExpandedItems(allIds);
  const collapseAll = () => setExpandedItems([]);

  const handlePrevious = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
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
              <div className="expand-collapse-buttons">
                <button onClick={expandAll} className="button">Expand All</button>
                <button onClick={collapseAll} className="button">Collapse All</button>
              </div>
            </Col>
          </Row>

          {/* Parent List */}
          <Row>
            <Col>
              {currentData.map(item => (
                <div key={item.id} className="parent-item">
                  <span className="item-type">{item.type}</span>
                  <button 
                    onClick={() => toggleExpand(item.id)} 
                    className="button button-expand"
                    aria-expanded={expandedItems.includes(item.id)}
                  >
                    {expandedItems.includes(item.id) ? "▼" : "►"}
                  </button>
                  {expandedItems.includes(item.id) && item.children && (
                    <div className="child-container">
                      {item.children.map(child => (
                        <div key={child.id} className="child-item">
                          <span>{child.name}</span>
                          <button 
                            onClick={() => navigate(`/edit-questionnaire/${child.id}`)} 
                            className="plus-button" // Use new class for plus button
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

          {/* Pagination */}
          <Row>
            <Col className="text-center" style={{ marginTop: '20px' }}>
              <button onClick={handlePrevious} disabled={currentPage === 1} className="button">
                Previous
              </button>
              <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNext} disabled={currentPage === totalPages} className="button">
                Next
              </button>
              <select 
                value={itemsPerPage} 
                onChange={handleItemsPerPageChange} 
                style={{ marginLeft: '10px', padding: '5px' }}
                aria-label="Items per page"
              >
                <option value={10}>10 items</option>
                <option value={15}>15 items</option>
                <option value={25}>25 items</option>
              </select>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Questionnaires;
