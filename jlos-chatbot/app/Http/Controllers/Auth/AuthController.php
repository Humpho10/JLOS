<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create($data);

        // User implements MustVerifyEmail, so this queues the signed-link
        // verification email automatically via the default notification.
        event(new Registered($user));

        $this->claimGuestConversations($request, $user);

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('spa')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Those credentials do not match our records.'],
            ]);
        }

        $this->claimGuestConversations($request, $user);

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('spa')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    /**
     * A guest's conversations are only reachable via their guest_token, so
     * signing in hands that token over one last time — anything found under
     * it gets attached to the new account instead of being orphaned.
     */
    protected function claimGuestConversations(Request $request, User $user): void
    {
        $guestToken = $request->input('guest_token');
        if (! $guestToken) {
            return;
        }

        Conversation::where('guest_token', $guestToken)
            ->whereNull('user_id')
            ->update(['user_id' => $user->id, 'guest_token' => null]);
    }
}
