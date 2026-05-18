<template>
    <div v-if="isVerify" class="verify-banner">
        <strong>发版验证模式</strong>
        <span>当前从 <code>{{ pkgName }}@{{ pkgVersion }}</code>（npm 安装包）加载，与业务项目一致</span>
    </div>
</template>

<script>
import {name, version} from '../../package.json';

function getInstalledVersion(pkgName) {
    try {
        return require(`${pkgName}/package.json`).version;
    } catch (e) {
        return version;
    }
}

export default {
    name: 'VerifyBanner',
    data() {
        const isVerify = process.env.VUE_APP_VERIFY === 'true';
        return {
            isVerify,
            pkgName: name,
            pkgVersion: isVerify ? getInstalledVersion(name) : version,
        };
    },
};
</script>

<style scoped>
.verify-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 20px;
    background: #fff7e6;
    border-bottom: 1px solid #ffd591;
    color: #ad6800;
    font-size: 13px;
    flex-shrink: 0;
}

.verify-banner code {
    background: rgba(0, 0, 0, 0.06);
    padding: 2px 6px;
    border-radius: 3px;
}
</style>
