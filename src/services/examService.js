// 考试服务
class ExamService {
  // 保存考试配置
  static saveExamConfig(config) {
    // 在实际应用中，这里会向服务器发送保存考试配置的请求
    return Promise.resolve(config);
  }

  // 获取考试配置
  static getExamConfig() {
    // 在实际应用中，这里会从服务器获取考试配置
    return Promise.resolve({
      duration: 60,
      sceneTransitionLimit: 10,
      allowGoBack: true
    });
  }

  // 保存评分设置
  static saveScoreSettings(settings) {
    // 在实际应用中，这里会向服务器发送保存评分设置的请求
    return Promise.resolve(settings);
  }

  // 获取评分设置
  static getScoreSettings() {
    // 在实际应用中，这里会从服务器获取评分设置
    return Promise.resolve({
      sceneCompletionScore: 10,
      timeBonusMultiplier: 1.5,
      errorPenalty: 5
    });
  }

  // 提交考试结果
  static submitExamResult(result) {
    // 在实际应用中，这里会向服务器发送考试结果
    return Promise.resolve({ success: true, id: Date.now().toString() });
  }

  // 获取考试历史记录
  static getExamHistory() {
    // 在实际应用中，这里会从服务器获取考试历史记录
    return Promise.resolve([]);
  }
}

export default ExamService;