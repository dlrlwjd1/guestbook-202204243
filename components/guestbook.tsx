'use client';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleAlert,
  Feather,
  LockKeyhole,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { developer } from '@/lib/developer';
import type { Entry } from '@/lib/types';

type Manage = { entry: Entry; mode: 'edit' | 'delete' };
async function requestApi<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했어요. 다시 시도해 주세요.');
  return data;
}
function displayDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : '연결을 확인하고 다시 시도해 주세요.';

export function Guestbook({
  initialEntries,
  initialError,
}: {
  initialEntries: Entry[];
  initialError: string;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [loadError, setLoadError] = useState(initialError);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState('');
  const [manage, setManage] = useState<Manage | null>(null);
  const listTitle = useRef<HTMLHeadingElement>(null);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await requestApi<{ entries: Entry[] }>('/api/entries');
      setEntries(data.entries);
      setLoadError('');
    } catch (error) {
      setLoadError(errorText(error));
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  return (
    <>
      <a href="#main" className="skip-link">
        본문으로 이동
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="한 줄 사이 홈">
            <span className="brand-icon">
              <BookOpen size={22} strokeWidth={1.8} />
            </span>
            <span>
              한 줄 사이<span className="brand-period">.</span>
            </span>
          </Link>
          <div className="header-right">
            <span className="open-badge">
              <span />
              누구에게나 열려 있어요
            </span>
            <a className="header-link" href="#write">
              한 줄 남기기 <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </header>
      <main id="main" className="page-shell">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-line" /> A LITTLE SPACE FOR YOUR WORDS
            </span>
            <h1 id="hero-title">
              작은 인사,
              <br />
              <span>오래 남는 이야기.</span>
            </h1>
            <p>
              짧은 안부부터 오늘의 이야기까지.
              <br />
              당신의 한 줄이 이곳에 머물렀으면 좋겠어요.
            </p>
            <a href="#entries" className="hero-link">
              우리의 이야기 읽기 <ArrowDown size={15} />
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="art-orbit" />
            <span className="art-spark one">✳</span>
            <span className="art-spark two">✧</span>
            <div className="note-back" />
            <div className="note-front">
              <span className="tape" />
              <span className="note-label">DEAR, YOU</span>
              <span className="note-handwriting">
                당신의 오늘은
                <br />
                어땠나요?
              </span>
              <span className="note-line" />
              <span className="note-line short" />
              <span className="note-heart">♡</span>
            </div>
            <div className="art-caption">a small hello goes a long way</div>
          </div>
        </section>
        <div className="section-divider">
          <span>서로의 하루에, 다정한 한 줄</span>
          <span className="divider-flower">✳</span>
        </div>
        <div className="board-layout">
          <aside className="composer-column" id="write">
            <CreateForm
              onCreated={(entry) => {
                setEntries((previous) => [entry, ...previous.filter((e) => e.id !== entry.id)]);
                setNotice('따뜻한 한 줄이 남겨졌어요.');
              }}
            />
            <div className="little-note">
              <Sparkles size={16} />
              <p>
                거창한 이야기가 아니어도 좋아요.
                <br />
                가벼운 인사 한마디도 환영합니다.
              </p>
            </div>
          </aside>
          <section className="entries-section" id="entries" aria-labelledby="entries-title">
            <div className="entries-heading">
              <div>
                <span className="eyebrow muted">THE GUESTBOOK</span>
                <h2 id="entries-title" ref={listTitle} tabIndex={-1}>
                  남겨진 이야기 <span className="count-badge">{entries.length}</span>
                </h2>
              </div>
              <button
                className="refresh-button"
                type="button"
                onClick={refresh}
                disabled={refreshing}
                aria-label="방명록 새로고침"
              >
                <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
                <span>{refreshing ? '불러오는 중' : '최신순'}</span>
              </button>
            </div>
            {loadError && (
              <div className="error-message load-error" role="alert">
                <CircleAlert size={18} />
                <span>{loadError}</span>
                <button onClick={refresh} disabled={refreshing}>
                  다시 시도
                </button>
              </div>
            )}
            {!loadError && entries.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <MessageCircle size={32} strokeWidth={1.4} />
                  <span>+</span>
                </div>
                <h3>첫 번째 이야기를 기다려요.</h3>
                <p>
                  아직 아무도 다녀가지 않은 이곳에
                  <br />
                  가장 먼저 당신의 흔적을 남겨 주세요.
                </p>
                <a href="#write">
                  첫 인사 남기기 <ArrowUpRight size={16} />
                </a>
              </div>
            )}
            <div className="entry-list">
              {entries.map((entry, index) => (
                <article key={entry.id} className="entry-card" aria-label={`${entry.name}님의 글`}>
                  <div className="entry-top">
                    <div className="author">
                      <span className={`avatar avatar-${index % 4}`}>
                        {Array.from(entry.name)[0]}
                      </span>
                      <div>
                        <h3>{entry.name}</h3>
                        <time dateTime={entry.createdAt}>{displayDate(entry.createdAt)}</time>
                      </div>
                    </div>
                    <span className="entry-number">
                      #{String(entries.length - index).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="entry-message">{entry.message}</p>
                  <div className="entry-bottom">
                    <span className="entry-signature">
                      {entry.updatedAt ? (
                        <span title={displayDate(entry.updatedAt)}>마음을 다듬었어요 · 수정됨</span>
                      ) : (
                        <>
                          <span className="small-dot" /> 한 줄의 마음
                        </>
                      )}
                    </span>
                    <div className="entry-actions">
                      <button
                        type="button"
                        onClick={() => setManage({ entry, mode: 'edit' })}
                        aria-label={`${entry.name}님의 글 수정`}
                      >
                        <Pencil size={13} />
                        수정
                      </button>
                      <span />
                      <button
                        type="button"
                        onClick={() => setManage({ entry, mode: 'delete' })}
                        aria-label={`${entry.name}님의 글 삭제`}
                      >
                        <Trash2 size={13} />
                        삭제
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {entries.length > 0 && (
              <div className="list-end">
                <span />
                <Feather size={16} />
                <span />
                <p>모든 이야기를 읽었어요.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <div>
          <span className="footer-brand">
            <BookOpen size={17} /> 한 줄 사이.
          </span>
          <span className="footer-copy">한 줄 한 줄, 마음이 모이는 곳.</span>
        </div>
        <p>
          만든 사람 <strong>{developer.name}</strong>
          <span className="footer-dot">·</span>학번 <strong>{developer.studentId}</strong>
        </p>
      </footer>
      <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">
        {notice && (
          <>
            <span>
              <Check size={15} />
            </span>
            {notice}
          </>
        )}
      </div>
      {manage && (
        <ManageDialog
          key={`${manage.entry.id}-${manage.mode}`}
          {...manage}
          onClose={() => setManage(null)}
          onSaved={(updated) => {
            setEntries((previous) => previous.map((e) => (e.id === updated.id ? updated : e)));
            setNotice('이야기가 수정되었어요.');
            setManage(null);
          }}
          onDeleted={(id) => {
            setEntries((previous) => previous.filter((e) => e.id !== id));
            setNotice('이야기가 삭제되었어요.');
            setManage(null);
            requestAnimationFrame(() => listTitle.current?.focus());
          }}
        />
      )}
    </>
  );
}

function CreateForm({ onCreated }: { onCreated: (entry: Entry) => void }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const data = await requestApi<{ entry: Entry }>('/api/entries', 'POST', {
        name: values.get('name'),
        message,
        password: values.get('password'),
      });
      onCreated(data.entry);
      form.reset();
      setMessage('');
    } catch (error) {
      setError(errorText(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="composer" onSubmit={submit} aria-labelledby="compose-title">
      <div className="composer-heading">
        <span className="compose-icon">
          <Pencil size={20} />
        </span>
        <div>
          <h2 id="compose-title">한 줄 남기기</h2>
          <p>당신의 이야기가 궁금해요.</p>
        </div>
        <span className="compose-plus">
          <Plus size={18} />
        </span>
      </div>
      <div className="form-body">
        <label htmlFor="name">
          이름 <span className="required">*</span>
        </label>
        <input
          id="name"
          name="name"
          placeholder="어떤 이름으로 기억할까요?"
          maxLength={30}
          autoComplete="nickname"
          required
          disabled={busy}
        />
        <div className="label-row">
          <label htmlFor="message">
            메시지 <span className="required">*</span>
          </label>
          <span>{message.length.toLocaleString()} / 1,000</span>
        </div>
        <textarea
          id="message"
          name="message"
          placeholder={'오늘의 안부, 하고 싶은 말,\n무엇이든 편하게 남겨 주세요.'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          maxLength={1000}
          required
          disabled={busy}
        />
        <label htmlFor="password">
          글 비밀번호 <span className="required">*</span>
        </label>
        <div className="password-field">
          <LockKeyhole size={16} />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="4자 이상 입력해 주세요"
            minLength={4}
            maxLength={128}
            autoComplete="new-password"
            required
            disabled={busy}
          />
        </div>
        <p className="field-help">글을 수정하거나 삭제할 때 필요해요.</p>
        {error && (
          <p className="error-message" role="alert">
            <CircleAlert size={16} />
            {error}
          </p>
        )}
        <button className="primary-button submit-button" type="submit" disabled={busy}>
          {busy ? (
            <>
              <RefreshCw size={17} className="spin" />
              남기는 중...
            </>
          ) : (
            <>
              이야기 남기기 <Send size={16} />
            </>
          )}
        </button>
        <p className="form-footnote">
          <LockKeyhole size={12} />
          가입 없이, 나만의 비밀번호로
        </p>
      </div>
    </form>
  );
}

function ManageDialog({
  entry,
  mode,
  onClose,
  onSaved,
  onDeleted,
}: Manage & {
  onClose: () => void;
  onSaved: (entry: Entry) => void;
  onDeleted: (id: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState(entry.message);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isEdit = mode === 'edit';
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      if (isEdit) {
        const data = await requestApi<{ entry: Entry }>(`/api/entries/${entry.id}`, 'PATCH', {
          message,
          password,
        });
        onSaved(data.entry);
      } else {
        await requestApi(`/api/entries/${entry.id}`, 'DELETE', { password });
        onDeleted(entry.id);
      }
    } catch (error) {
      setError(errorText(error));
      setPassword('');
      requestAnimationFrame(() => passwordRef.current?.focus());
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      className="manage-dialog"
      ref={ref}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className={`dialog-icon ${isEdit ? '' : 'danger'}`}>
          {isEdit ? <Pencil size={22} /> : <Trash2 size={22} />}
        </div>
        <button
          className="dialog-close icon-button"
          type="button"
          aria-label="닫기"
          onClick={onClose}
          disabled={busy}
        >
          <X size={21} />
        </button>
        <h2 id="dialog-title">{isEdit ? '이야기 다듬기' : '이야기를 지울까요?'}</h2>
        <p id="dialog-description">
          {isEdit ? '전하고 싶은 마음을 다시 적어 주세요.' : '삭제한 글은 되돌릴 수 없어요.'}
          <br />
          작성할 때 정한 비밀번호로 확인할게요.
        </p>
        <div className="dialog-author">
          <span>{Array.from(entry.name)[0]}</span>
          <strong>{entry.name}</strong>
          <time dateTime={entry.createdAt}>{displayDate(entry.createdAt)}</time>
        </div>
        {isEdit ? (
          <>
            <div className="label-row">
              <label htmlFor="edit-message">메시지</label>
              <span>{message.length} / 1,000</span>
            </div>
            <textarea
              id="edit-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={1000}
              rows={5}
              disabled={busy}
            />
          </>
        ) : (
          <blockquote className="delete-preview">{entry.message}</blockquote>
        )}
        <label htmlFor="manage-password">글 비밀번호</label>
        <div className="password-field">
          <LockKeyhole size={16} />
          <input
            id="manage-password"
            ref={passwordRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            placeholder="작성할 때 입력한 비밀번호"
            required
            minLength={4}
            maxLength={128}
            disabled={busy}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'manage-error' : undefined}
          />
        </div>
        {error && (
          <p id="manage-error" className="error-message" role="alert">
            <CircleAlert size={16} />
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose} disabled={busy}>
            취소
          </button>
          <button
            className={`primary-button ${isEdit ? '' : 'delete-button'}`}
            disabled={busy}
            type="submit"
          >
            {busy ? '처리 중...' : isEdit ? '수정 완료' : '삭제하기'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
