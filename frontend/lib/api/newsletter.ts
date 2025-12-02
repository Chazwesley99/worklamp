import { apiClient } from '../api';

export interface NewsletterSubscribeData {
  email: string;
  name?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const newsletterApi = {
  subscribe: async (data: NewsletterSubscribeData) => {
    return await apiClient.post('/api/newsletter/subscribe', data);
  },

  unsubscribe: async (token: string) => {
    return await apiClient.post('/api/newsletter/unsubscribe', { token });
  },

  sendNewsletter: async (subject: string, title: string, content: string) => {
    return await apiClient.post('/api/newsletter/send', { subject, title, content });
  },
};

export const contactApi = {
  send: async (data: ContactFormData) => {
    return await apiClient.post('/api/contact', data);
  },
};
