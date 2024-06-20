import { create } from 'zustand'

export const useLoginStore = create((set) => ({
  

  email: localStorage.getItem('email') || undefined,
  password: undefined,
  login: (email ,password) => {
    localStorage.setItem('email', email);
    set({email: email,password: password});
  },
  logout: () => {
    localStorage.removeItem('email');
    set({email: undefined,password: undefined});
  },
}))