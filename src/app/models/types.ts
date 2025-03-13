// app/models/types.ts
export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    user_type: 'landlord' | 'tenant';
    phone?: string;
    bio?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Property {
    id: string;
    owner_id: string;
    title: string;
    description?: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    size?: number;
    address: string;
    city: string;
    state: string;
    zip?: string;
    latitude?: number;
    longitude?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Virtual fields (not in database)
    images?: Image[];
    owner?: Profile;
  }
  
  export interface Image {
    id: string;
    property_id: string;
    url: string;
    position: number;
    created_at: string;
  }
  
  export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    property_id?: string;
    content: string;
    is_read: boolean;
    created_at: string;
    // Virtual fields
    sender?: Profile;
    receiver?: Profile;
    property?: Property;
  }
  
  export interface Favorite {
    id: string;
    user_id: string;
    property_id: string;
    created_at: string;
    // Virtual fields
    property?: Property;
  }