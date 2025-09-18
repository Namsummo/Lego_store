'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface TutorialModalProps {
  showTutorial: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ showTutorial, onClose }) => {
  if (!showTutorial) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-white text-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Hướng dẫn chơi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p><strong>🎯 Mục tiêu:</strong> Tạo 5 quân cờ liên tiếp</p>
            <p><strong>🎮 Cách chơi:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Người chơi X (đỏ) đi trước</li>
              <li>Người chơi O (xanh) đi sau</li>
              <li>Click vào ô trống để đặt quân cờ</li>
              <li>Thắng theo hàng ngang, dọc hoặc chéo</li>
            </ul>
            <p><strong>🤖 Cấp độ AI:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Dễ:</strong> AI đơn giản, phù hợp người mới</li>
              <li><strong>Trung bình:</strong> AI cân bằng, thử thách vừa phải</li>
              <li><strong>Khó:</strong> AI thông minh, thử thách cao</li>
            </ul>
          </div>
          <Button onClick={onClose} className="w-full bg-purple-500 text-white hover:bg-purple-600">
            Bắt đầu chơi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialModal;
