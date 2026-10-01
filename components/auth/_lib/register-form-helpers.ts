export type RegisterValues = {
  name: string;
  email?: string;
  phone_number?: string;
  password: string;
  confirmed_password: string;
};

export type Step = 'verification' | 'form';
