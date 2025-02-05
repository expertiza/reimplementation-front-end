import React, { useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import { IQuestionnaire } from "../../utils/interfaces";
import dummyData from './dummyData.json';
import Pagination from '../../components/Table/Pagination';
import './Questionnaire.css';

const Questionnaires = () => {
  const navigate = useNavigate();
  const [questionnaireData, setQuestionnaireData] = useState<IQuestionnaire[]>(dummyData);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filterBySearchTerm = (item: IQuestionnaire) => {
    return (
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.children && item.children.some(child => child.name && child.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  };

  const filteredQuestionnaires = useMemo(() => {
    return questionnaireData.filter(filterBySearchTerm);
  }, [questionnaireData, searchTerm]);

  const totalPages = Math.ceil(filteredQuestionnaires.length / itemsPerPage);
  const currentData = filteredQuestionnaires.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const allIds = useMemo(() => currentData.map(item => item.id), [currentData]);

  const expandAll = () => setExpandedItems(allIds);
  const collapseAll = () => setExpandedItems([]);

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
                            className="plus-button"
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

          <Row>
            <Col className="text-center" style={{ marginTop: '20px' }}>
              <Pagination
                nextPage={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                previousPage={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                canNextPage={() => currentPage < totalPages}
                canPreviousPage={() => currentPage > 1}
                setPageIndex={setCurrentPage}
                setPageSize={setItemsPerPage}
                getPageCount={() => totalPages}
                getState={() => ({
                  pagination: {
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                  },
                  columnFilters: [],
                  globalFilter: "",
                  sorting: [],
                  expanded: {},
                  columnVisibility: {},
                  columnOrder: [],
                  columnPinning: {},
                  rowPinning: {},
                  grouping: [],
                  columnSizing: {}, 
                  columnSizingInfo: {
                    columnSizingStart: [], 
                    deltaOffset: 0,
                    deltaPercentage: 0,
                    isResizingColumn: false,
                    startOffset: 0, 
                    startSize: 0,  
                  },
                  rowSelection: {},
                })}                
              />
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Questionnaires;
