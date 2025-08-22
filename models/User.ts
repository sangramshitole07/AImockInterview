import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    interviewStyle: 'technical' | 'behavioral' | 'mixed';
    difficulty: 'adaptive' | 'fixed';
    persona: 'faang' | 'startup' | 'enterprise' | 'academic';
  };
  profile: {
    selectedLanguages: string[];
    skillLevel: number;
    totalInterviews: number;
    averageScore: number;
    skillRatings: {
      [key: string]: number;
    };
    recentPerformance: {
      date: Date;
      language: string;
      score: number;
      questionsAnswered: number;
    }[];
  };
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  preferences: {
    interviewStyle: {
      type: String,
      enum: ['technical', 'behavioral', 'mixed'],
      default: 'technical',
    },
    difficulty: {
      type: String,
      enum: ['adaptive', 'fixed'],
      default: 'adaptive',
    },
    persona: {
      type: String,
      enum: ['faang', 'startup', 'enterprise', 'academic'],
      default: 'faang',
    },
  },
  profile: {
    selectedLanguages: [{
      type: String,
      default: [],
    }],
    skillLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    totalInterviews: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    skillRatings: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    recentPerformance: [{
      date: {
        type: Date,
        default: Date.now,
      },
      language: String,
      score: Number,
      questionsAnswered: Number,
    }],
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);