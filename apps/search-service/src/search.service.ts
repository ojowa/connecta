import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  async searchUsers(query: any) {
    return { message: 'Search users — to be implemented', users: [] };
  }

  async autocomplete(query: any) {
    return { message: 'Autocomplete — to be implemented', suggestions: [] };
  }
}
