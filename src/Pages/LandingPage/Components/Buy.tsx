import MemeCoin from './MemeCoin';
import './Buy.css';
import See from '../../../assets/Seemore.svg';
import memeCoinList from './hardcodedAddress';

function Buy() {
  return (
    <div>
      <div className="Coin_grid">
        {memeCoinList.map((coin, index) => (
          <MemeCoin
            key={index}
            tokenAddress={coin.tokenAddress}
            poolAddress={coin.poolAddress}
          />
        ))}
      </div>
      <img src={See} alt="See more" className="See_more" />
    </div>
  );
}

export default Buy;
