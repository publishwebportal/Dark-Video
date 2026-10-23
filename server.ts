import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Increase limit for high-res base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.resolve(__dirname, 'data');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public/uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to read catalog safely
function readCatalog(): any[] {
  try {
    if (fs.existsSync(CATALOG_FILE)) {
      const data = fs.readFileSync(CATALOG_FILE, 'utf-8');
      const items = JSON.parse(data);
      if (Array.isArray(items)) {
        return items.map((item: any) => ({
          ...item,
          thumbnailUrl: typeof item.thumbnailUrl === 'string'
            ? item.thumbnailUrl.replace('/src/assets/images/', '/images/')
            : item.thumbnailUrl,
        }));
      }
    }
  } catch (err) {
    console.error('Error reading catalog:', err);
  }
  return [];
}

// Helper to write catalog safely
function writeCatalog(items: any[]) {
  try {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(items, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing catalog:', err);
    return false;
  }
}

// API Routes

// 1. Get all videos (publicly accessible by all viewers)
app.get('/api/videos', (req, res) => {
  const catalog = readCatalog();
  res.json({ success: true, videos: catalog });
});

// 2. Upload image permanently (saves to public/uploads/)
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Handle base64 DataURL (e.g., data:image/png;base64,...)
    const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    let ext = 'jpg';
    let base64Data = image;

    if (matches && matches.length === 3) {
      ext = matches[1].replace('jpeg', 'jpg');
      base64Data = matches[2];
    } else if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
      // Already an external URL or static path
      return res.json({ success: true, url: image });
    }

    const timestamp = Date.now();
    const cleanName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30) : 'poster';
    const savedFileName = `${timestamp}_${cleanName}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, savedFileName);

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${savedFileName}`;
    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Image upload failed:', err);
    res.status(500).json({ error: 'Failed to save image permanently', details: err?.message });
  }
});

// 3. Add new video permanently
app.post('/api/videos', (req, res) => {
  try {
    const newVideo = req.body;
    if (!newVideo || !newVideo.title) {
      return res.status(400).json({ error: 'Invalid video item' });
    }

    const catalog = readCatalog();
    // Add to the beginning so newest appears first or by date
    const updated = [newVideo, ...catalog.filter((v: any) => v.id !== newVideo.id)];
    writeCatalog(updated);

    res.json({ success: true, video: newVideo, total: updated.length });
  } catch (err: any) {
    console.error('Failed to add video:', err);
    res.status(500).json({ error: 'Server error adding video' });
  }
});

// 4. Update existing video permanently (title, category, image, etc.)
app.put('/api/videos/:id', (req, res) => {
  try {
    const videoId = req.params.id;
    const updates = req.body;
    const catalog = readCatalog();

    const index = catalog.findIndex((v: any) => v.id === videoId);
    if (index === -1) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const updatedVideo = { ...catalog[index], ...updates };
    catalog[index] = updatedVideo;
    writeCatalog(catalog);

    res.json({ success: true, video: updatedVideo });
  } catch (err: any) {
    console.error('Failed to update video:', err);
    res.status(500).json({ error: 'Server error updating video' });
  }
});

// 5. Delete video permanently
app.delete('/api/videos/:id', (req, res) => {
  try {
    const videoId = req.params.id;
    const catalog = readCatalog();

    const filtered = catalog.filter((v: any) => v.id !== videoId);
    writeCatalog(filtered);

    res.json({ success: true, deletedId: videoId, total: filtered.length });
  } catch (err: any) {
    console.error('Failed to delete video:', err);
    res.status(500).json({ error: 'Server error deleting video' });
  }
});

// ==========================================
// SUBSCRIPTION SYSTEM (MANUAL OWNER APPROVAL)
// ==========================================
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');

interface SubRequest {
  id: string;
  phone: string;
  trxId: string;
  method: string;
  amount: number;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  note?: string;
}

interface ApprovedSub {
  phone: string;
  approvedAt: string;
  expiresAt: string;
  source: string;
}

interface SubscriptionsData {
  requests: SubRequest[];
  approvedList: ApprovedSub[];
}

function readSubscriptions(): SubscriptionsData {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      const data = fs.readFileSync(SUBS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        requests: Array.isArray(parsed?.requests) ? parsed.requests : [],
        approvedList: Array.isArray(parsed?.approvedList) ? parsed.approvedList : [],
      };
    }
  } catch (err) {
    console.error('Error reading subscriptions:', err);
  }
  return { requests: [], approvedList: [] };
}

function writeSubscriptions(data: SubscriptionsData) {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing subscriptions:', err);
    return false;
  }
}

// 6. Customer submits a subscription request (STATUS = PENDING, NOT AUTOMATICALLY GRANTED)
app.post('/api/subscriptions/request', (req, res) => {
  try {
    const { phone, trxId, method } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length !== 11) {
      return res.status(400).json({ error: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রয়োজন।' });
    }

    const data = readSubscriptions();

    // Check if phone already in approvedList and still active
    const now = Date.now();
    const existingApproved = data.approvedList.find(
      (item) => item.phone === cleanPhone && new Date(item.expiresAt).getTime() > now
    );
    if (existingApproved) {
      return res.json({
        success: true,
        status: 'approved',
        isVip: true,
        expiresAt: existingApproved.expiresAt,
        message: 'আপনার সাবস্ক্রিপশন ইতিমধ্যে অনুমোদিত ও সক্রিয় রয়েছে।',
      });
    }

    const newRequest: SubRequest = {
      id: 'sub_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      phone: cleanPhone,
      trxId: trxId ? String(trxId).trim() : 'NOT_PROVIDED',
      method: method || 'bkash',
      amount: 100,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    // Store request (latest first, replacing older pending for same phone if any)
    data.requests = [newRequest, ...data.requests.filter((r) => r.phone !== cleanPhone || r.status !== 'pending')];
    writeSubscriptions(data);

    res.json({
      success: true,
      status: 'pending',
      isVip: false,
      request: newRequest,
      message: 'আপনার সাবস্ক্রিপশন আবেদন জমা হয়েছে। মালিক যাচাই করে অনুমোদন (Approve) না করা পর্যন্ত কোনো সাবস্ক্রিপশন চালু হবে না।',
    });
  } catch (err: any) {
    console.error('Failed to submit subscription request:', err);
    res.status(500).json({ error: 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।' });
  }
});

// 7. Check subscription status for a phone number
app.get('/api/subscriptions/status', (req, res) => {
  try {
    const phone = req.query.phone ? String(req.query.phone).replace(/\D/g, '') : '';
    if (!phone) {
      return res.json({ isVip: false, status: 'none' });
    }

    const data = readSubscriptions();
    const now = Date.now();

    // Check if in approvedList
    const approvedItem = data.approvedList.find(
      (item) => item.phone === phone && new Date(item.expiresAt).getTime() > now
    );

    if (approvedItem) {
      return res.json({
        isVip: true,
        status: 'approved',
        phone,
        approvedAt: approvedItem.approvedAt,
        expiresAt: approvedItem.expiresAt,
      });
    }

    // Check pending requests
    const pendingReq = data.requests.find((r) => r.phone === phone && r.status === 'pending');
    if (pendingReq) {
      return res.json({
        isVip: false,
        status: 'pending',
        phone,
        requestedAt: pendingReq.requestedAt,
      });
    }

    // Check if rejected
    const rejectedReq = data.requests.find((r) => r.phone === phone && r.status === 'rejected');
    if (rejectedReq) {
      return res.json({
        isVip: false,
        status: 'rejected',
        phone,
      });
    }

    return res.json({ isVip: false, status: 'none', phone });
  } catch (err: any) {
    console.error('Failed to check status:', err);
    res.status(500).json({ error: 'Status check failed' });
  }
});

// 8. Admin: Get all subscription requests & approved list (For Owner Panel)
app.get('/api/subscriptions/admin-list', (req, res) => {
  try {
    const data = readSubscriptions();
    res.json({
      success: true,
      requests: data.requests,
      approvedList: data.approvedList,
      totalPending: data.requests.filter((r) => r.status === 'pending').length,
      totalApproved: data.approvedList.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin list' });
  }
});

// 9. Admin: Approve a pending subscription (Owner explicitly wants to grant)
app.post('/api/subscriptions/approve', (req, res) => {
  try {
    const { id, phone, days = 30 } = req.body;
    const data = readSubscriptions();

    let targetPhone = phone ? String(phone).replace(/\D/g, '') : '';
    if (id) {
      const reqItem = data.requests.find((r) => r.id === id);
      if (reqItem) {
        reqItem.status = 'approved';
        reqItem.approvedAt = new Date().toISOString();
        targetPhone = reqItem.phone;
      }
    } else if (targetPhone) {
      data.requests.forEach((r) => {
        if (r.phone === targetPhone && r.status === 'pending') {
          r.status = 'approved';
          r.approvedAt = new Date().toISOString();
        }
      });
    }

    if (!targetPhone) {
      return res.status(400).json({ error: 'ফোন নম্বর পাওয়া যায়নি।' });
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Add or update approvedList
    data.approvedList = [
      {
        phone: targetPhone,
        approvedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        source: 'owner_manual_approval',
      },
      ...data.approvedList.filter((item) => item.phone !== targetPhone),
    ];

    writeSubscriptions(data);

    res.json({
      success: true,
      message: `নম্বর ${targetPhone} সফলভাবে অনুমোদন করা হয়েছে। ৩০ দিনের জন্য ভিআইপি সক্রিয়।`,
      approvedItem: data.approvedList[0],
    });
  } catch (err: any) {
    console.error('Failed to approve subscription:', err);
    res.status(500).json({ error: 'Approval failed' });
  }
});

// 10. Admin: Reject a pending subscription
app.post('/api/subscriptions/reject', (req, res) => {
  try {
    const { id, phone } = req.body;
    const data = readSubscriptions();

    let targetPhone = phone ? String(phone).replace(/\D/g, '') : '';

    if (id) {
      const reqItem = data.requests.find((r) => r.id === id);
      if (reqItem) {
        reqItem.status = 'rejected';
        targetPhone = reqItem.phone;
      }
    } else if (targetPhone) {
      data.requests.forEach((r) => {
        if (r.phone === targetPhone && r.status === 'pending') {
          r.status = 'rejected';
        }
      });
    }

    // Also remove from approvedList if present
    if (targetPhone) {
      data.approvedList = data.approvedList.filter((item) => item.phone !== targetPhone);
    }

    writeSubscriptions(data);

    res.json({
      success: true,
      message: `নম্বর ${targetPhone || id} বাতিল করা হয়েছে।`,
    });
  } catch (err: any) {
    console.error('Failed to reject subscription:', err);
    res.status(500).json({ error: 'Reject failed' });
  }
});

// 11. Admin: Direct Manual Grant (Owner directly gives VIP to a phone without request)
app.post('/api/subscriptions/manual-grant', (req, res) => {
  try {
    const { phone, days = 30 } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length !== 11) {
      return res.status(400).json({ error: '১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।' });
    }

    const data = readSubscriptions();
    const now = new Date();
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    data.approvedList = [
      {
        phone: cleanPhone,
        approvedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        source: 'owner_direct_grant',
      },
      ...data.approvedList.filter((item) => item.phone !== cleanPhone),
    ];

    writeSubscriptions(data);

    res.json({
      success: true,
      message: `নম্বর ${cleanPhone} কে সফলভাবে ${days} দিনের ভিআইপি সাবস্ক্রিপশন প্রদান করা হয়েছে।`,
      approvedItem: data.approvedList[0],
    });
  } catch (err: any) {
    console.error('Manual grant failed:', err);
    res.status(500).json({ error: 'Manual grant failed' });
  }
});

// 12. Admin: Revoke VIP access from a phone
app.post('/api/subscriptions/revoke', (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const data = readSubscriptions();

    data.approvedList = data.approvedList.filter((item) => item.phone !== cleanPhone);
    data.requests.forEach((r) => {
      if (r.phone === cleanPhone) {
        r.status = 'rejected';
      }
    });

    writeSubscriptions(data);

    res.json({
      success: true,
      message: `নম্বর ${cleanPhone} এর ভিআইপি এক্সেস বাতিল করা হয়েছে।`,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Revoke failed' });
  }
});

// Serve public static folder
app.use(express.static(path.resolve(__dirname, 'public')));

async function startServer() {
  if (!isProd) {
    // In dev: mount Vite middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In prod: serve built assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running permanently on http://0.0.0.0:${PORT}`);
  });
}

startServer();
