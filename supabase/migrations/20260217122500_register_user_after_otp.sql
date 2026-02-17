-- RPC 함수: OTP 인증 후 사용자 프로필 생성
-- 이 함수는 auth.users에 생성된 사용자를 우리 스키마(users, user_profile, user_identity)에 등록합니다.
CREATE OR REPLACE FUNCTION public.register_user_after_otp(
  _auth_user_id uuid,
  _email citext,
  _nickname text,
  _signup_method text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  _user_id bigint;
  _existing_user_id bigint;
begin
  -- 1) 기존 유저 확인 및 업데이트
  select user_id into _existing_user_id
  from public.users
  where auth_user_id = _auth_user_id
  limit 1;

  if _existing_user_id is not null then
    update public.users
    set
      email = coalesce(_email, email),
      nickname = _nickname,
      signup_method = coalesce(_signup_method, signup_method),
      updated_at = now(),
      deleted_at = null
    where user_id = _existing_user_id;

    -- identity 보강 (user_id -> auth_user_id 로 수정)
    insert into public.user_identity (auth_user_id, provider, provider_uid, created_at)
    values (_auth_user_id, 'email', _email::text, now())
    on conflict (auth_user_id, provider) do nothing;

    return jsonb_build_object('success', true, 'user_id', _existing_user_id, 'message', 'User updated');
  end if;

  -- 2) 신규 유저 생성
  insert into public.users (
    auth_user_id,
    email,
    nickname,
    signup_method,
    created_at,
    updated_at,
    deleted_at
  )
  values (
    _auth_user_id,
    _email,
    _nickname,
    coalesce(_signup_method, 'email'),
    now(),
    now(),
    null
  )
  returning user_id into _user_id;

  -- 3) user_identity 생성 (user_id -> auth_user_id 로 수정)
  insert into public.user_identity (auth_user_id, provider, provider_uid, created_at)
  values (_auth_user_id, 'email', _email::text, now())
  on conflict (auth_user_id, provider) do nothing;

  return jsonb_build_object('success', true, 'user_id', _user_id, 'message', 'User registered successfully');

exception
  when others then
    raise log 'register_user_after_otp 에러: %', sqlerrm;
    raise exception '회원가입 실패: %', sqlerrm;
end;
$$;

-- 권한 및 소유자 설정 재실행
ALTER FUNCTION public.register_user_after_otp OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.register_user_after_otp TO anon, authenticated, service_role;
-- 함수 설명 추가
COMMENT ON FUNCTION public.register_user_after_otp IS
'OTP 인증 후 사용자 프로필을 생성합니다. auth.users에 생성된 사용자를 우리 스키마에 등록합니다.';

