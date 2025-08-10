import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateEmail, sanitizeInput, RateLimiter } from '@/utils/security';

interface ContactForm {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

const contactRateLimiter = new RateLimiter(3, 15 * 60 * 1000);

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactForm>({
    defaultValues: {
      fullName: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);

    try {
      // Client-side email validation
      const emailCheck = validateEmail(data.email);
      if (!emailCheck.isValid) {
        throw new Error(emailCheck.error || 'Invalid email address');
      }

      // Client-side rate limiting
      if (!contactRateLimiter.isAllowed('contact_form')) {
        const remainingMs = contactRateLimiter.getRemainingTime('contact_form');
        const seconds = Math.ceil(remainingMs / 1000);
        throw new Error(`Too many attempts. Try again in ${seconds}s`);
      }

      const sanitizedData: ContactForm = {
        fullName: sanitizeInput(data.fullName).slice(0, 120),
        email: data.email.trim().toLowerCase(),
        subject: sanitizeInput(data.subject).slice(0, 150),
        message: data.message.trim().slice(0, 2000),
      };

      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: sanitizedData,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      form.reset();
      toast({
        title: 'Message sent!',
        description: "Thanks for reaching out! We'll get back to you within 24 hours.",
      });
    } catch (error: any) {
      console.error('Error sending contact email:', { name: error?.name, message: error?.message });
      toast({
        title: 'Error',
        description: error?.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0F23] via-[#1A1A3A] to-[#2D1B69] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-white mb-4">Message Sent!</h2>
          <p className="text-gray-300 mb-6">
            Thanks for reaching out! We'll get back to you within 24 hours.
          </p>
          <Link to="/">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F23] via-[#1A1A3A] to-[#2D1B69]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-gray-300 text-lg">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  rules={{ required: "Full name is required", maxLength: { value: 120, message: "Max 120 characters" } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Full Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          placeholder="Enter your full name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{ 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          placeholder="Enter your email address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  rules={{ required: "Please select a subject", maxLength: { value: 150, message: "Max 150 characters" } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Subject *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="Support" className="text-white hover:bg-gray-800">Support</SelectItem>
                          <SelectItem value="Feedback" className="text-white hover:bg-gray-800">Feedback</SelectItem>
                          <SelectItem value="Partnership" className="text-white hover:bg-gray-800">Partnership</SelectItem>
                          <SelectItem value="Other" className="text-white hover:bg-gray-800">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  rules={{ required: "Message is required", maxLength: { value: 2000, message: "Max 2000 characters" } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Message *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[120px]"
                          placeholder="Enter your message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#06B6D4] hover:from-[#6D28D9] hover:via-[#4F46E5] hover:to-[#0891B2] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;