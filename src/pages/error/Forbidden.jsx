import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Unauthorized.css';

const Forbidden = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(-1); 
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <div className="overlay" />
      <div className="w3-display-middle">
        <h1 className="w3-jumbo w3-animate-top w3-center"><code>Từ chối truy cập</code></h1>
        <hr className="w3-border-white w3-animate-left" style={{ margin: 'auto', width: '50%' }} />
        <h3 className="w3-center w3-animate-right">Bạn không có quyền truy cập trang này.</h3>
        <h3 className="w3-center w3-animate-zoom">🚫🚫🚫🚫</h3>
        <h6 className="w3-center w3-animate-zoom"><strong>Mã Lỗi</strong>: 403 FORBIDDEN</h6>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    </>
  );
};

export default Forbidden;
