export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  bio?: string;
  profile_picture?: string;
  last_seen?: string;
  date_joined?: string;
}