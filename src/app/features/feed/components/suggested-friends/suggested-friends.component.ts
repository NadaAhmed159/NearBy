import { Component, computed, signal } from '@angular/core';
export interface SuggestedFriend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  mutual: number;
  isFollowing: boolean;
}
@Component({
  selector: 'app-suggested-friends',
  imports: [],
  templateUrl: './suggested-friends.component.html',
  styleUrl: './suggested-friends.component.css',
})
export class SuggestedFriendsComponent {
  searchQuery = signal<string>('');

  friends = signal<SuggestedFriend[]>([
    {
      id: 'f1',
      name: 'Ahmed Bahnasy',
      handle: '@bahnasy2022..',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AhmedBahnasy',
      followers: 41,
      mutual: 2,
      isFollowing: false,
    },
  ]);

  filteredFriends = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.friends();
    return this.friends().filter(
      (f) => f.name.toLowerCase().includes(query) || f.handle.toLowerCase().includes(query),
    );
  });

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleFollow(friendId: string): void {
    this.friends.update((current) =>
      current.map((friend) =>
        friend.id === friendId ? { ...friend, isFollowing: !friend.isFollowing } : friend,
      ),
    );
  }
}
