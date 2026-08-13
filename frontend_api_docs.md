# Документация API Календаря (Групповое бронирование)

В данном документе описаны эндпоинты для работы с бронированием Campus Tour.
Оба эндпоинта находятся за API Gateway и защищены секретным ключом.

## Авторизация
Для всех запросов к эндпоинтам календаря необходимо передавать HTTP-заголовок `X-Aveda-Calendar-Secret`.

**Заголовок:**
```http
X-Aveda-Calendar-Secret: <ВАШ_СЕКРЕТНЫЙ_КЛЮЧ>
```
*(Секретный ключ выдается бекенд-командой и задается в переменной окружения `AVEDA_CALENDAR_SECRET`)*

---

## 1. Получение свободных слотов

Возвращает список доступных временных слотов для бронирования на конкретную дату. Учитывает график работы, текущие занятые (непрозрачные) события в Google Calendar и уже существующие бронирования в базе данных.

**Запрос:**
- **Метод:** `GET`
- **URL:** `/google/calendar/slots`
- **Query параметры:**
  - `date` (обязательный) — Дата в формате `YYYY-MM-DD` (например, `2026-08-15`).

**Пример запроса:**
```http
GET /google/calendar/slots?date=2026-08-15
X-Aveda-Calendar-Secret: my-super-secret-key
```

**Успешный ответ (200 OK):**
```json
{
  "date": "2026-08-15",
  "slots": [
    {
      "start_time": "2026-08-15T09:00:00-05:00",
      "end_time": "2026-08-15T10:00:00-05:00",
      "booked": 3,
      "available": 7
    },
    {
      "start_time": "2026-08-15T10:00:00-05:00",
      "end_time": "2026-08-15T11:00:00-05:00",
      "booked": 10,
      "available": 0
    }
  ]
}
```
*Примечание: Если на запрошенную дату нет рабочих часов (выходной), вернется пустой массив `slots`.*

---

## 2. Бронирование слота

Создает новую запись (ивент) в Google Calendar и сохраняет ее в базу данных. 

**Запрос:**
- **Метод:** `POST`
- **URL:** `/google/calendar/book`
- **Тело запроса (JSON):**

| Поле | Тип | Описание | Обязательно? |
| :--- | :--- | :--- | :--- |
| `start_time` | string | Время начала слота в формате RFC3339 | Да |
| `end_time` | string | Время окончания слота в формате RFC3339 | Да |
| `title` | string | Название события. По умолчанию `Campus Tour` | Нет |
| `guest_name` | string | Имя гостя. Если передано, название события будет `Campus Tour - <guest_name>` | Нет |
| `guest_email` | string | Email гостя (сюда может быть отправлено приглашение) | Нет |
| `description` | string | Дополнительное описание (например, номер телефона) | Нет |

**Пример запроса:**
```http
POST /google/calendar/book
Content-Type: application/json
X-Aveda-Calendar-Secret: my-super-secret-key

{
  "start_time": "2026-08-15T09:00:00-05:00",
  "end_time": "2026-08-15T10:00:00-05:00",
  "guest_name": "John Doe",
  "guest_email": "john.doe@example.com",
  "description": "Phone: +1-204-555-1234"
}
```

**Успешный ответ (200 OK):**
```json
{
  "message": "booking successful",
  "google_event_id": "8aj2...google_event_id...39f",
  "transparency": "transparent",
  "booked": 4,
  "max_capacity": 10
}
```

**Ошибки:**

- **400 Bad Request:** Отсутствуют или неверный формат обязательных параметров (например, времени).
- **401 Unauthorized:** Не передан, или передан неверный `X-Aveda-Calendar-Secret`.
- **409 Conflict:** Слот уже полностью заполнен.
  ```json
  {
    "error": "slot is full",
    "booked": 10,
    "max_capacity": 10
  }
  ```
- **500 Internal Server Error:** Ошибка на стороне сервера (ошибка Google API или базы данных).
