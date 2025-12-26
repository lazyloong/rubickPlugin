<template>
  <div class="capture-group-panel">
    <div class="panel-header">
      <h3>捕获组详情</h3>
    </div>

    <div class="capture-content">
      <div v-if="matches.length === 0" class="empty-state">
        <el-empty description="暂无匹配结果" />
      </div>

      <el-collapse v-else v-model="activeCollapse" class="matches-collapse">
        <el-collapse-item
          v-for="(match, matchIndex) in matches"
          :key="matchIndex"
          :name="matchIndex"
          :title="`匹配 ${matchIndex + 1}: ${formatMatchText(match.match)}`"
        >
          <div class="match-details">
            <div class="match-info">
              <div class="info-item">
                <span class="label">位置:</span>
                <span class="value">{{ match.start }} - {{ match.end }}</span>
              </div>
              <div class="info-item">
                <span class="label">长度:</span>
                <span class="value">{{ match.match.length }} 字符</span>
              </div>
            </div>

            <div class="groups-section">
              <h4>捕获组:</h4>
              <div v-for="(group, groupIndex) in match.groups" :key="groupIndex" class="group-item">
                <span class="group-index">组 {{ groupIndex + 1 }}:</span>
                <span class="group-content">{{ group || '(空)' }}</span>
              </div>

              <div v-if="match.groups.length === 0" class="no-groups">无捕获组</div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import type { RegexMatch } from '../types/regex';

interface Props {
  matches: RegexMatch[];
}

export default defineComponent({
  name: 'CaptureGroupPanel',
  props: {
    matches: {
      type: Array as PropType<RegexMatch[]>,
      default: () => [],
    },
  },
  setup() {
    const activeCollapse = ref<string[]>([]);

    const formatMatchText = (text: string): string => {
      if (text.length > 50) {
        return text.substring(0, 47) + '...';
      }
      return text;
    };

    return {
      activeCollapse,
      formatMatchText,
    };
  },
});
</script>

<style lang="less" scoped>
.capture-group-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      margin: 0;
      color: #303133;
    }
  }

  .capture-content {
    flex: 1;
    overflow: auto;

    .empty-state {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .matches-collapse {
      border: none;

      :deep(.el-collapse-item__header) {
        font-weight: 500;
        border-bottom: 1px solid #e4e7ed;
      }

      :deep(.el-collapse-item__content) {
        padding-bottom: 16px;
      }
    }

    .match-details {
      padding: 0 16px;

      .match-info {
        display: flex;
        gap: 24px;
        margin-bottom: 16px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;

        .info-item {
          display: flex;
          gap: 8px;

          .label {
            font-weight: 500;
            color: #606266;
          }

          .value {
            color: #303133;
          }
        }
      }

      .groups-section {
        h4 {
          margin: 0 0 12px 0;
          color: #303133;
        }

        .group-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 12px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border-radius: 4px;
          border-left: 3px solid #409eff;

          .group-index {
            font-weight: 500;
            color: #409eff;
            min-width: 60px;
          }

          .group-content {
            flex: 1;
            word-break: break-all;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          }
        }

        .no-groups {
          text-align: center;
          color: #909399;
          font-style: italic;
          padding: 20px;
        }
      }
    }
  }
}
</style>
