<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class EmailVerificationController extends Controller
{
    /**
     * The link a verification email points at. A human clicks this straight
     * from their inbox — no Bearer token attached — so it's authenticated
     * purely by Laravel's `signed` middleware, not auth:sanctum. Ends by
     * bouncing back to the SPA rather than returning JSON.
     */
    public function verify(Request $request, int $id, string $hash)
    {
        $user = User::findOrFail($id);
        $frontend = rtrim(config('app.frontend_url'), '/');

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return Redirect::away("{$frontend}/?verified=0");
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return Redirect::away("{$frontend}/?verified=1");
    }

    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent.']);
    }
}
