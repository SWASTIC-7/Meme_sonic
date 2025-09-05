import './coinData.css';
import Doge from '../../../assets/Original_Doge_meme.jpg';

function CoinData() {
  return (
    <div className="MemeCoin2">
      <div className="Coin2">
        <img className="Coin_photu2" src={Doge} alt="King of the Hill" />
        <div className="Coin_details2">
          <h3>CREATED BY: SWASY</h3>
          <h3>MARKET CAP: 29K</h3>
          <h3>REPLIES: 89</h3>
          <h3>NAME: DOGE</h3>
        </div>
      </div>
    </div>
  );
}

export default CoinData;
