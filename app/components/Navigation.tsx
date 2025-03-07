import Link from 'next/link';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex gap-4">
        <Link 
          href="/" 
          className="text-white hover:text-gray-300 transition-colors"
        >
          Home
        </Link>
        <Link 
          href="/suggestions" 
          className="text-white hover:text-gray-300 transition-colors"
        >
          Suggestions
        </Link>
      </div>
    </nav>
  );
};

export default Navigation; 