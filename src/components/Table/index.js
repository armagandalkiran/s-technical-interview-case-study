import axios from "axios";
import { useState, useEffect, useRef } from "react";
import Loading from "../Loading";
import ScrollLoading from "../ScrollLoading";

const Table = () => {
  const [pageData, setPageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const observer = useRef();
  const pageChange = useRef(24);

  const lastCharacterElementRef = (node) => {
    if (isLoading === true) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting ) {
        pageChange.current = pageChange.current + 24;
        fetchData();
      }
    });
    if (node) observer.current.observe(node);
  };

  const parseDate = (date) => {
    date = date.slice(0, 10);
    return date;
  };

  const fetchData = async () => {
    try {
        setIsLoading(true);
      await axios
        .get(`${process.env.REACT_APP_API_CALL}`)
        .then((res) => res.data.body.intraDayTradeHistoryList)
        .then((data) => {
          setPageData(data.slice(0,pageChange.current));
        });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Toplam İşlem Miktarı (MWh)</th>
            <th>Toplam İşlem Tutarı (TL)</th>
            <th>Ağırlık Ortalama Fiyat (TL/MWh)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && pageChange.current === 24 ? (
            <Loading />
          ) : (
            pageData.map((item, idx) => {
              if (pageData.length === idx + 1) {
                return (
                  <tr key={idx} ref={lastCharacterElementRef}>
                    <td>{item.id}</td>
                    <td>{parseDate(item.date)}</td>
                    <td>{item.conract}</td>
                    <td>{item.price}</td>
                  </tr>
                );
              }else{
                  return (
                    <tr key={idx}>
                    <td>{item.id}</td>
                    <td>{parseDate(item.date)}</td>
                    <td>{item.conract}</td>
                    <td>{item.price}</td>
                  </tr>
                  )
              }
            })
          )}
        </tbody>
      </table>
      <ScrollLoading/>
      {/* <div className="table--end">
          SAYFA SONUNDASINIZ !
      </div> */}
    </>
  );
};

export default Table;
