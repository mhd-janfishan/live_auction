<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'bidder']);

        $admin = User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@liveauction.com',
            'password' => bcrypt('admin1234'),
        ]);
        $admin->assignRole('admin');

        $user = User::factory()->create([
            'name' => 'Bidder 1',
            'email' => 'bidder@liveauction.com',
            'password' => bcrypt('user1234'),
        ]);
        $user->assignRole('bidder');
    }
}
