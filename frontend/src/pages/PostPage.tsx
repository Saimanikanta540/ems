
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommentSection from '@/components/CommentSection';
import TagsCloud from '@/components/TagsCloud';
import { formatDate } from '@/lib/data';
import { Heart, MessageSquare, Clock, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/PostCard';
import { api } from '@/lib/api';
import { Post as PostType, Comment as CommentType } from '@/types/blog';

// API response types
interface CommentApiResponse {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

interface PostApiResponse {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  likes: number;
  commentCount: number;
  readTime: number;
}

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const placeholderImage = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80";

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const p = await api.get(`/posts/slug/${slug}`);
        if (!isMounted) return;
        // Backend returns PostViewDto; map to frontend Post type keys are aligned already
        setPost({
          id: String(p.id),
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          content: p.content,
          coverImage: p.coverImage,
          author: { id: String(p.author.id), name: p.author.name, avatar: p.author.avatar },
          tags: Array.isArray(p.tags) ? p.tags : [],
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          featured: p.featured,
          likes: p.likes,
          commentCount: p.commentCount,
          readTime: p.readTime,
        });
        const allComments: CommentApiResponse[] = await api.get('/comments');
        if (!isMounted) return;
        const filtered = (allComments || []).filter((c: CommentApiResponse) => String(c.postId) === String(p.id));
        setComments(
          filtered.map((c: CommentApiResponse) => ({
            id: String(c.id),
            postId: String(c.postId),
            userId: String(c.userId),
            userName: c.userName,
            userAvatar: c.userAvatar,
            content: c.content,
            createdAt: c.createdAt,
          }))
        );
        const list: PostApiResponse[] = await api.get('/posts');
        if (!isMounted) return;
        const mapped = (list || [])
          .filter((x: PostApiResponse) => x.slug !== p.slug)
          .slice(0, 3)
          .map((x: PostApiResponse) => ({
            id: String(x.id),
            title: x.title,
            slug: x.slug,
            excerpt: x.excerpt,
            content: x.content,
            coverImage: x.coverImage,
            author: { id: String(x.author.id), name: x.author.name, avatar: x.author.avatar },
            tags: Array.isArray(x.tags) ? x.tags : [],
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
            featured: x.featured,
            likes: x.likes,
            commentCount: x.commentCount,
            readTime: x.readTime,
          }));
        setRelatedPosts(mapped);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [slug]);

  if (!post && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="mb-6">The post you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/posts">Browse Articles</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <article>
          {/* Header */}
          <header className="max-w-3xl mx-auto mb-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post?.tags.map(tag => (
                <Link 
                  key={tag}
                  to={`/tag/${tag.toLowerCase()}`}
                  className="bg-light-gray/50 hover:bg-light-gray/70 px-3 py-1 rounded-full text-sm text-navy/70 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-navy mb-6">
              {post?.title}
            </h1>
            
            {/* Author and Meta */}
            <div className="flex items-center mb-6">
              <img
                src={post?.author.avatar || '/placeholder.svg'}
                alt={post?.author.name || 'Author'}
                className="h-12 w-12 rounded-full object-cover mr-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder.svg";
                }}
              />
              <div className="mr-auto">
                <Link to={`/author/${post?.author.id}`} className="text-navy font-medium hover:text-teal">
                  {post?.author.name}
                </Link>
                <div className="flex items-center text-sm text-navy/60">
                  <span>{post ? formatDate(post.createdAt) : ''}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {post?.readTime} min read
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <Share2 size={18} />
                </Button>
                <Button variant="outline" size="icon">
                  <Bookmark size={18} />
                </Button>
              </div>
            </div>
          </header>
          
          {/* Featured Image */}
          <figure className="mb-10">
            <img
              src={post?.coverImage || placeholderImage}
              alt={post?.title || 'Post'}
              className="w-full max-h-96 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = placeholderImage;
              }}
            />
          </figure>
          
          {/* Content */}
          <div className="max-w-3xl mx-auto">
            <div 
              className="prose-custom"
              dangerouslySetInnerHTML={{ __html: post?.content || '' }}
            />
            
            {/* Action Bar */}
            <div className="border-t border-b border-light-gray/40 py-4 my-10 flex justify-between items-center">
              <div className="flex space-x-4">
                <Button variant="outline" className="flex items-center">
                  <Heart size={18} className="mr-2" />
                  Like ({post?.likes ?? 0})
                </Button>
                <Button variant="outline" className="flex items-center">
                  <MessageSquare size={18} className="mr-2" />
                  Comment ({post?.commentCount ?? 0})
                </Button>
              </div>
              <Button variant="ghost" size="icon">
                <Share2 size={18} />
              </Button>
            </div>
            
            {/* Comments Section */}
            {post && <CommentSection comments={comments} postId={post.id} />}
          </div>
        </article>
        
        {/* Related Posts */}
        <section className="mt-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-serif font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="mt-16 max-w-3xl mx-auto bg-light-gray/30 p-8 rounded-lg">
          <div className="text-center">
            <h3 className="text-xl font-serif font-bold mb-3">Enjoy this article?</h3>
            <p className="mb-6 text-navy/80">Subscribe to get the latest posts delivered straight to your inbox.</p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-2 rounded-l-md border border-light-gray focus:outline-none focus:ring-1 focus:ring-teal"
              />
              <Button className="rounded-l-none bg-teal hover:bg-teal/90 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PostPage;
