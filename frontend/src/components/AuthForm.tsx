
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === 'register') {
        const res = await api.post('/auth/register', { name, email, password });
        setUser(res);
        toast({
          title: 'Account created successfully!',
          description: 'You can now start creating and sharing your stories.',
        });
      } else {
        const res = await api.post('/auth/login', { email, password });
        setUser(res);
        toast({
          title: 'Welcome back!',
          description: 'You have been logged in.',
        });
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-serif">
          {type === 'login' ? 'Welcome Back' : 'Create an Account'}
        </CardTitle>
        <CardDescription>
          {type === 'login' 
            ? 'Sign in to your StoryHub account' 
            : 'Join StoryHub to start sharing your stories'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={type === 'login' ? 'Enter your password' : 'Create a password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          {type === 'login' && (
            <Link to="/forgot-password" className="text-sm text-teal hover:underline block text-right">
              Forgot your password?
            </Link>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-teal hover:bg-teal/90 text-white"
            disabled={isLoading}
          >
            {isLoading 
              ? (type === 'login' ? 'Signing In...' : 'Creating Account...') 
              : (type === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {type === 'login' ? (
          <p className="text-sm text-navy/70">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p className="text-sm text-navy/70">
            Already have an account?{' '}
            <Link to="/login" className="text-teal hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
