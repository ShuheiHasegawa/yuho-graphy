"use client";

import React, { useState } from "react";
import { Modal, Tabs, Card, Button, Tag } from "antd";
import { LayoutTemplate, PhotobookUserPermission } from "@/types/photobook";
import { layoutCategories } from "@/constants/layoutTemplates";

const { TabPane } = Tabs;

interface LayoutSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (template: LayoutTemplate) => void;
  userPermission?: PhotobookUserPermission;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  userPermission = PhotobookUserPermission.FREE,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    layoutCategories[0]?.id || ""
  );

  // 選択したレイアウトをハンドル
  const handleSelectLayout = (template: LayoutTemplate) => {
    // プレミアムテンプレートかつ無料ユーザーの場合はアップグレード案内
    if (template.isPremium && userPermission === PhotobookUserPermission.FREE) {
      Modal.info({
        title: "プレミアム会員限定テンプレート",
        content: (
          <div>
            <p>このテンプレートはプレミアム会員限定です。</p>
            <p>有料会員へのアップグレードをご検討ください。</p>
          </div>
        ),
        okText: "閉じる",
      });
      return;
    }

    onSelect(template);
    onClose();
  };

  // テンプレートのサムネイル表示
  const renderTemplateCard = (template: LayoutTemplate) => {
    const isPremiumLocked =
      template.isPremium && userPermission === PhotobookUserPermission.FREE;

    return (
      <Card
        key={template.id}
        hoverable
        style={{
          width: 200,
          margin: "0 10px 20px",
          opacity: isPremiumLocked ? 0.7 : 1,
        }}
        cover={
          <div
            style={{
              height: 150,
              background: "#f5f5f5",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* テンプレートのサムネイル画像（実装時はイメージを用意） */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                width: "80%",
                height: "80%",
                gap: "4px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {template.photoPositions.map((pos, index) => (
                <div
                  key={index}
                  style={{
                    width: `${Math.min(pos.width, 30)}%`,
                    height: `${Math.min(pos.height, 30)}%`,
                    background: "#ddd",
                    borderRadius: "2px",
                  }}
                />
              ))}
            </div>

            {/* プレミアムバッジ */}
            {template.isPremium && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  padding: "2px 8px",
                  background: "linear-gradient(45deg, #FFD700, #FFA500)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  borderBottomLeftRadius: "4px",
                }}
              >
                Premium
              </div>
            )}

            {/* ロックアイコン */}
            {isPremiumLocked && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "24px",
                  color: "#555",
                }}
              >
                🔒
              </div>
            )}
          </div>
        }
        onClick={() => handleSelectLayout(template)}
      >
        <Card.Meta title={template.name} description={template.description} />
        <div style={{ marginTop: "8px" }}>
          <Tag color="blue">{template.photoPositions.length}枚</Tag>
          {template.isPremium && <Tag color="gold">Premium</Tag>}
        </div>
      </Card>
    );
  };

  return (
    <Modal
      title="レイアウトを選択"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          キャンセル
        </Button>,
      ]}
    >
      <Tabs
        activeKey={selectedCategory}
        onChange={setSelectedCategory}
        tabPosition="left"
      >
        {layoutCategories.map((category) => (
          <TabPane
            tab={
              <span>
                {category.name}
                {category.id === "premium" &&
                  userPermission !== PhotobookUserPermission.FREE && (
                    <Tag color="gold" style={{ marginLeft: "5px" }}>
                      Pro
                    </Tag>
                  )}
              </span>
            }
            key={category.id}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                padding: "10px",
              }}
            >
              {category.templates.map((template) =>
                renderTemplateCard(template)
              )}
            </div>
          </TabPane>
        ))}
      </Tabs>
    </Modal>
  );
};

export default LayoutSelector;
