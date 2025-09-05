import Data from './coin_data';
import './Coin_buy.css';
function Coin_buy() {
  return (
    <div>
      <h1 className="halo">TRADE</h1>
      <Data />
      <button className="buy_btn">BUY</button>
    </div>
  );
}

export default Coin_buy;
