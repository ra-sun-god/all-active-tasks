import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(path.dirname(__filename), '../../.env') });
