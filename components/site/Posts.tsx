import { posts } from '@/content/site';
import { asset } from '@/lib/asset';

export default function Posts() {
  return (
    <section id="posts" className="section section-alt" aria-labelledby="posts-title">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">{posts.eyebrow}</span>
          <h2 id="posts-title" className="section-title">{posts.title}</h2>
          <p className="section-lead">{posts.lead}</p>
        </div>
        <ul className="card-grid card-grid-3">
          {posts.items.map((post) => (
            <li key={post.title} className="post-card">
              <img src={asset(post.image.src)} alt={post.image.alt} width={800} height={500} loading="lazy" />
              <div className="post-body">
                <p className="post-meta">
                  <span className="post-category">{post.category}</span>
                  {' · '}
                  <time dateTime={post.date}>{post.dateLabel}</time>
                </p>
                <h3 className="post-title"><a href={post.href}>{post.title}</a></h3>
                <p className="post-excerpt">{post.excerpt}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
