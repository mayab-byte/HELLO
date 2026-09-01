import { trust } from '@/content/site';

export default function TrustBar() {
  return (
    <section className="trust-bar" aria-label="נתונים בקצרה">
      <div className="container">
        <ul className="trust-list">
          {trust.map((item) => (
            <li key={item.label} className="trust-item">
              <span className="trust-value">{item.value}</span>
              <span className="trust-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
