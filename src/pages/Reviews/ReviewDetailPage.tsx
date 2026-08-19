import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { RoundRow } from "../../utils/heatgridUtils";
import ReviewTable from "../../components/Table/ReviewTable";

interface DetailData {
  title: string;
  data: RoundRow[][];
}

const ReviewDetailPage = () => {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (!key) { setError(true); return; }
    const raw = sessionStorage.getItem(key);
    if (!raw) { setError(true); return; }
    try {
      setDetail(JSON.parse(raw));
    } catch {
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <Container className="mt-5">
        <p className="text-danger">Could not load review detail. The session may have expired.</p>
      </Container>
    );
  }

  if (!detail) return null;

  return (
    <Container fluid className="p-4">
      <h2 style={{ textAlign: "left", marginBottom: "16px" }}>{detail.title}</h2>
      {detail.data.length === 0
        ? <p>No submitted responses found.</p>
        : <ReviewTable data={detail.data} roundSelected={-1} />
      }
    </Container>
  );
};

export default ReviewDetailPage;
