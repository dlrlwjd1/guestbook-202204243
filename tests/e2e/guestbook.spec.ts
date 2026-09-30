import { expect, test } from '@playwright/test';

test('실제 화면에서 작성·새로고침·오답 거부·수정·삭제가 동작한다', async ({ page }, testInfo) => {
  const name = `방문자-${testInfo.project.name}-${Date.now()}`.slice(0, 30);
  await page.goto('/');
  await expect(page.getByText('202204243', { exact: true })).toBeVisible();
  await expect(page.locator('footer')).toContainText('이기정');
  await page.getByLabel('이름', { exact: false }).fill(name);
  await page
    .getByLabel('메시지', { exact: false })
    .fill('반갑습니다! 오늘도 좋은 하루 보내세요.\n다음에 또 놀러 올게요.');
  await page.getByLabel('글 비밀번호', { exact: false }).fill('my-password');
  await page.getByRole('button', { name: '이야기 남기기' }).click();
  const article = page.getByRole('article', { name: `${name}님의 글` });
  await expect(article).toBeVisible();
  await page.reload();
  await expect(article).toContainText('다음에 또 놀러 올게요.');
  await page.screenshot({
    path: `test-results/guestbook-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await article.getByRole('button', { name: `${name}님의 글 수정` }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('메시지', { exact: true }).fill('새롭게 다듬은 이야기입니다.');
  await dialog.getByLabel('글 비밀번호').fill('wrong-password');
  await dialog.getByRole('button', { name: '수정 완료' }).click();
  await expect(dialog.getByRole('alert')).toContainText('비밀번호가 일치하지 않습니다');
  await dialog.getByLabel('글 비밀번호').fill('my-password');
  await dialog.getByRole('button', { name: '수정 완료' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(article).toContainText('새롭게 다듬은 이야기입니다.');
  await expect(article).toContainText('수정됨');
  await page.reload();
  await expect(article).toContainText('새롭게 다듬은 이야기입니다.');
  await article.getByRole('button', { name: `${name}님의 글 삭제` }).click();
  await dialog.getByLabel('글 비밀번호').fill('wrong-password');
  await dialog.getByRole('button', { name: '삭제하기' }).click();
  await expect(dialog.getByRole('alert')).toContainText('비밀번호가 일치하지 않습니다');
  await dialog.getByLabel('글 비밀번호').fill('my-password');
  await dialog.getByRole('button', { name: '삭제하기' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(article).not.toBeVisible();
  await page.reload();
  await expect(article).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('API도 잘못된 비밀번호·외부 출처·빈 입력을 거부하고 비밀 정보를 노출하지 않는다', async ({
  request,
}) => {
  const invalid = await request.post('/api/entries', {
    data: { name: ' ', message: 'test', password: '1234' },
  });
  expect(invalid.status()).toBe(400);
  const created = await request.post('/api/entries', {
    data: { name: 'API 검증', message: '<script>alert(1)</script>', password: 'api-password' },
  });
  expect(created.status()).toBe(201);
  const { entry } = await created.json();
  expect(Object.keys(entry).sort()).toEqual(['createdAt', 'id', 'message', 'name', 'updatedAt']);
  try {
    expect(
      (
        await request.patch(`/api/entries/${entry.id}`, {
          data: { message: '거부해야 함', password: 'wrong-password' },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.delete(`/api/entries/${entry.id}`, { data: { password: 'wrong-password' } })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.patch(`/api/entries/${entry.id}`, {
          headers: { Origin: 'https://example.com' },
          data: { message: '거부해야 함', password: 'api-password' },
        })
      ).status(),
    ).toBe(403);
    const list = await (await request.get('/api/entries')).json();
    expect(list.entries.find((e: { id: string }) => e.id === entry.id).message).toBe(
      '<script>alert(1)</script>',
    );
    expect(JSON.stringify(list)).not.toContain('password');
  } finally {
    expect(
      (
        await request.delete(`/api/entries/${entry.id}`, { data: { password: 'api-password' } })
      ).status(),
    ).toBe(200);
  }
});
