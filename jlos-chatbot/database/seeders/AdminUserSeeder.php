<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Creates (or updates) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD
 * in .env, never hardcoded — .env stays out of git, so this file is safe to
 * commit even though it controls who gets admin access. Falls back to an
 * obviously-fake local-only default so a fresh dev setup still has
 * something to sign in with, but a real deployment must set both env vars
 * before seeding or it inherits that same placeholder password.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@example.test');
        $password = env('ADMIN_PASSWORD', 'change-me-now');

        $user = User::updateOrCreate(
            ['email' => $email],
            ['name' => 'Admin', 'password' => $password, 'email_verified_at' => now()]
        );

        // role is deliberately excluded from User::$fillable (see the
        // model) so it can never be set through mass assignment like the
        // array above — direct property assignment is the one path that's
        // allowed to grant it.
        $user->role = 'admin';
        $user->save();

        $this->command?->info("Admin account ready: {$email}");
    }
}
