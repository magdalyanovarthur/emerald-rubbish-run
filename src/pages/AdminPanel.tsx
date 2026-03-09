import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { STATUS_LABELS, STATUS_COLORS, OrderStatus } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Package, X, BarChart3, Download, Filter, Search, CalendarIcon, MapPin, Clock, User, Truck, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';

type FilterStatus = 'all' | OrderStatus;

const AdminPanel: React.FC = () => {
  const { orders, updateOrderStatus, chats, messages, getOrderMessages } = useApp();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'chats'>('orders');
  const [expandedChat, setExpandedChat] = useState<string | null>(null);

  // Filter orders within 1 year
  const yearAgo = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => new Date(o.createdAt).toISOString() >= yearAgo)
      .filter(o => filterStatus === 'all' || o.status === filterStatus)
      .filter(o => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.clientName.toLowerCase().includes(q) ||
          o.street.toLowerCase().includes(q) ||
          (o.courierName || '').toLowerCase().includes(q)
        );
      })
      .filter(o => {
        if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false;
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59);
          if (new Date(o.createdAt) > to) return false;
        }
        return true;
      });
  }, [orders, filterStatus, searchQuery, dateFrom, dateTo, yearAgo]);

  const stats = {
    total: orders.length,
    searching: orders.filter(o => o.status === 'searching').length,
    on_the_way: orders.filter(o => o.status === 'on_the_way').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const exportToXLS = () => {
    const data = filteredOrders.map(o => ({
      '№ Заказа': o.id,
      'Клиент': o.clientName,
      'Курьер': o.courierName || '—',
      'Улица': o.street,
      'Дом': o.house,
      'Квартира': o.apartment,
      'Подъезд': o.entrance,
      'Дата заказа': o.scheduledDate ? new Date(o.scheduledDate).toLocaleDateString('ru-RU') : '—',
      'Время': o.scheduledTime || '—',
      'Статус': STATUS_LABELS[o.status],
      'Создан': new Date(o.createdAt).toLocaleString('ru-RU'),
      'Комментарий': o.comment || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Заказы');

    // Auto-width columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(r => String((r as Record<string, unknown>)[key] || '').length)) + 2,
    }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `orders_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'searching', label: 'Поиск' },
    { value: 'on_the_way', label: 'В пути' },
    { value: 'completed', label: 'Выполнено' },
    { value: 'cancelled', label: 'Отменено' },
  ];

  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <h2 className="text-lg font-bold text-foreground">Админ-панель</h2>
        <p className="text-sm text-muted-foreground">Управление заказами и чатами</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <Package className="w-4 h-4 inline mr-1.5" />Заказы
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'chats' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-1.5" />Чаты ({chats.length})
        </button>
      </div>

      {activeTab === 'orders' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-card rounded-2xl p-3 text-center">
              <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">Всего</p>
            </div>
            <div className="glass-card rounded-2xl p-3 text-center">
              <p className="text-xl font-bold text-warning">{stats.searching}</p>
              <p className="text-[10px] text-muted-foreground">Ищут курьера</p>
            </div>
            <div className="glass-card rounded-2xl p-3 text-center">
              <p className="text-xl font-bold text-primary">{stats.on_the_way}</p>
              <p className="text-[10px] text-muted-foreground">В пути</p>
            </div>
            <div className="glass-card rounded-2xl p-3 text-center">
              <p className="text-xl font-bold text-success">{stats.completed}</p>
              <p className="text-[10px] text-muted-foreground">Выполнено</p>
            </div>
          </div>

          {/* Search */}
          <div className="glass-card rounded-2xl p-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск по ID, клиенту, адресу..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Date filters */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground mb-1 block">От</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary text-foreground text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground mb-1 block">До</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary text-foreground text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Status filter chips */}
            <div className="flex gap-1.5 flex-wrap">
              {statusFilters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                    filterStatus === f.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={exportToXLS}
            disabled={filteredOrders.length === 0}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Скачать отчёт (.xlsx)
          </button>

          {/* Results count */}
          <p className="text-xs text-muted-foreground">
            Найдено заказов: {filteredOrders.length}
            {filteredOrders.length !== orders.length && ` из ${orders.length}`}
          </p>

          {/* Orders list */}
          <div className="space-y-2">
            {filteredOrders.map(order => (
              <div key={order.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => navigate(`/order/${order.id}`)}>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">#{order.id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.clientName}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-foreground">{order.street}, д. {order.house}, кв. {order.apartment}, п. {order.entrance}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground">
                      {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '—'} в {order.scheduledTime || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground">
                      Создан: {new Date(order.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {order.courierName && (
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-muted-foreground" />
                      <p className="text-[11px] text-muted-foreground">Курьер: {order.courierName}</p>
                    </div>
                  )}
                  {order.comment && (
                    <p className="text-[11px] text-muted-foreground mt-1">💬 {order.comment}</p>
                  )}
                </div>

                {(order.status === 'searching' || order.status === 'on_the_way') && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="w-full py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" /> Отменить заказ
                  </button>
                )}
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="glass-card rounded-2xl p-8 text-center">
                <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Заказы не найдены</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'chats' && (
        <div className="space-y-2">
          {chats.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Чатов пока нет</p>
            </div>
          ) : (
            chats.map(chat => {
              const order = orders.find(o => o.id === chat.orderId);
              const chatMessages = getOrderMessages(chat.orderId);
              const isExpanded = expandedChat === chat.orderId;

              return (
                <div key={chat.orderId} className="glass-card rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedChat(isExpanded ? null : chat.orderId)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-semibold text-foreground">Заказ #{chat.orderId}</span>
                        <span className="text-[10px] text-muted-foreground">({chatMessages.length} сообщ.)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{order?.clientName || '—'}</span>
                        <span>↔</span>
                        <Truck className="w-3 h-3" />
                        <span>{order?.courierName || '—'}</span>
                      </div>
                      {chat.lastMessage && (
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">
                          Последнее: {chat.lastMessage}
                        </p>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border">
                      <div className="space-y-2 mt-3 max-h-64 overflow-y-auto">
                        {chatMessages.map(msg => (
                          <div key={msg.id} className="flex gap-2">
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-semibold text-foreground">{msg.senderName}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(msg.timestamp).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-foreground mt-0.5">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                        {chatMessages.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">Сообщений нет</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
