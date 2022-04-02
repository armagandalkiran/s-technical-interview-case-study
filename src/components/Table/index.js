import axios from "axios";
import { useState, useEffect, useRef } from "react";
import Loading from "../Loading";

const Table = () => {
  const [pageData, setPageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let temp = useRef();

  const parseDate = (date) => {
    const year = Number(date.slice(2,4)) + 2000;
    const month = date.slice(4,6);
    const day = date.slice(6,8);
    const time = date.slice(8,10);
    const newDate = day + "." + month + "." + year + " " +time+":00";

    return newDate;
  };

  const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  const calculate = (data) => {
    let tempObj = {
      tl: 0,
      mwh: 0,
      ort: 0,
      conract: "",
    };

    let tempArr = [];

    Object.keys(data).forEach((key, index) => {
      data[key].map((item, idx) => {
        tempObj = {
          ...tempObj,
          tl: tempObj.tl + (item.price * item.quantity) / 10,
          mwh: tempObj.mwh + (item.quantity / 10),
          conract: item.conract
        }
        tempObj.ort = tempObj.tl / tempObj.mwh;
        return tempObj;
      });
      tempArr.push(tempObj);
    });
    setPageData(tempArr);
  };

  useEffect(() => {
    async function fetchData(){
      try {
        setIsLoading(true);
        await axios
          .get(`${process.env.REACT_APP_API_CALL}`)
          .then((res) => res.data.body.intraDayTradeHistoryList)
          .then((data) => {
            data = data.filter((item) => item.conract.slice(0, 2) !== "PB");
            temp.current = groupBy(data, "conract");
            calculate(temp.current);
          });
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }
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
          {isLoading ? (
            <Loading />
          ) : (
            pageData.map((item, idx) => {
              return (
                <tr key={idx}>
                  <td>{parseDate(item.conract)}</td>
                  <td>{item.mwh.toFixed(2)}</td>
                  <td>{item.tl.toFixed(2)}</td>
                  <td>{item.ort.toFixed(2)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </>
  );
};

export default Table;
