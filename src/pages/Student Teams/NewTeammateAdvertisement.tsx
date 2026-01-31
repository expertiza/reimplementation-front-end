import React, { useState, FC, useEffect } from 'react';
import useAPI from 'hooks/useAPI';
import { useSearchParams } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import styles from "./NewTeammateAdvertisement.module.css"

const NewTeammateAdvertisement: FC = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [adExist, setAdExist] = useState(false);
  const { isLoading, data: adInfo, sendRequest: getAdvertisement } = useAPI();
  const { data: createAdResponse, sendRequest: createAdvertisement, reset: resetCreate } = useAPI();
  const { data: updateAdResponse, sendRequest: updateAdvertisement, reset: resetUpdate } = useAPI();
  const { data: deleteAdResponse, sendRequest: removeAdvertisement, reset: resetDelete } = useAPI();

  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("team_id") ?? "";

  useEffect(() => {
    getAdvertisement({
      url: `/signed_up_teams/${teamId}`
    });
  }, [])

  useEffect(() => {
    if (adInfo?.data) {
      const { comments_for_advertisement, advertise_for_partner } = adInfo.data;
      if (!advertise_for_partner) {
        setAdExist(false);
        setItems([]);
        return;
      }
      const skills = comments_for_advertisement.split(' &AND& ');
      setItems(skills);
      setAdExist(true);

    }
  }, [adInfo]);

  useEffect(() => {
    const updateToastMessage = (response: any) => {
      if (response.data.success) {
        setShowAlert(false);
      } else {
        setShowAlert(true)
      }

      setToastMessage(response.data.message);
      const timeout = setTimeout(() => {
        setToastMessage("");
        setShowAlert(false);
        resetAllLogs(false, true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
    if (createAdResponse) {
      if (createAdResponse.data.success) {
        setAdExist(true);
      }
      updateToastMessage(createAdResponse)
    }

    if (updateAdResponse) {
      updateToastMessage(updateAdResponse)
    }
    if (deleteAdResponse) {
      if (deleteAdResponse.data.success) {
        setAdExist(false);
        setItems([])
      }
      updateToastMessage(deleteAdResponse)
    }
  }, [createAdResponse, updateAdResponse, deleteAdResponse]);

  const resetAllLogs = (error: boolean, data: boolean) => {
    resetCreate?.(error, data);
    resetUpdate?.(error, data);
    resetDelete?.(error, data);
  };

  const handleAdd = () => {
    if (input && input.trim().length > 0) {
      setItems([input.trim(), ...items]); // new items on top
      setInput("");
    }
  };

  const handleRemove = (index: any) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Handle the form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requirements = items.join(' &AND& ');
    try {
      if (adExist) {
        updateAdvertisement({
          method: 'PATCH', url: `/signed_up_teams/${teamId}/update_advertisement`, data: {
            comments_for_advertisement: requirements
          }
        })
      }
      else {
        createAdvertisement({
          method: 'POST', url: `/signed_up_teams/${teamId}/create_advertisement`, data: {
            comments_for_advertisement: requirements
          }
        })
      }
    }
    catch (error: any) {

    }
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      removeAdvertisement({
        method: 'DELETE', url: `/signed_up_teams/${teamId}/remove_advertisement`,
      });
    }
    catch (error: any) {

    }
  };

  if (isLoading)
    return (<div style={{ width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Spinner />
    </div>);

  return (
    <div>
      <div>
        {toastMessage && (
          <Alert className={showAlert ? "flash_note alert alert-warning" : "flash_note alert alert-success"}>
            {toastMessage}
          </Alert>
        )}
      </div>
      <div className={styles.container}>
        <div>
          <h1 className={styles.header}>Teammate Advertisement</h1>
          <p className={styles.formLabel}>Please describe the qualifications you are looking for in a teammate.</p>
        </div>
        <div className={styles.adContainer}>
          {/* List */}
          <div className={styles.adList}>
            {items.map((item, index) => (
              <div className={styles.adListItem} key={index}>
                <span>{item}</span>
                <button className={styles.adRemoveBtn} onClick={() => handleRemove(index)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Input area */}
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type the skills/qualifications you require..."
          ></textarea>
          <button onClick={handleAdd} disabled={input.trim().length === 0} className={styles.submitButton}>Add</button>
        </div>

        <div>
          <button className={styles.createAdButton} onClick={() => window.history.back()}>
            Back
          </button>

          <button className={styles.createAdButton} style={{ marginLeft: "15px" }} onClick={handleSubmit} disabled={items.length === 0}>
            {adExist ? "Update advertisement" : "Create advertisement"}
          </button>

          {adExist && <button className={styles.createAdButton} style={{ marginLeft: "15px" }} onClick={handleDelete} disabled={items.length === 0}>
            Delete advertisement
          </button>}
        </div>
      </div>
    </div>
  );
};

export default NewTeammateAdvertisement;